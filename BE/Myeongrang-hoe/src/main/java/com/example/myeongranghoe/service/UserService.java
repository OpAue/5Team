package com.example.myeongranghoe.service;

import com.example.myeongranghoe.domain.UserAccount;
import com.example.myeongranghoe.dto.UserResponse;
import com.example.myeongranghoe.repository.UserAccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class UserService {
    private static final Set<String> ALLOWED_CAMPUSES = Set.of("인문캠퍼스", "자연캠퍼스");

    private final UserAccountRepository userAccountRepository;
    private final EmailVerificationService emailVerificationService;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserAccountRepository userAccountRepository,
            EmailVerificationService emailVerificationService,
            PasswordEncoder passwordEncoder) {
        this.userAccountRepository = userAccountRepository;
        this.emailVerificationService = emailVerificationService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public boolean isEmailTaken(String email) {
        return userAccountRepository.existsByEmail(normalize(email));
    }

    @Transactional
    public UserResponse signUp(SignUpCommand command) {
        String email = normalize(command.email());
        if (userAccountRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("이미 가입된 이메일이에요. 로그인 탭을 이용해주세요.");
        }
        if (!emailVerificationService.isEmailVerifiedForSignup(email)) {
            throw new IllegalArgumentException("이메일 인증이 완료되지 않았어요. 인증을 먼저 진행해주세요.");
        }
        if (command.password() == null || command.password().length() < 8) {
            throw new IllegalArgumentException("비밀번호는 8자 이상이어야 해요.");
        }
        if (command.name() == null || command.name().isBlank()) {
            throw new IllegalArgumentException("이름은 필수입니다.");
        }
        if (!ALLOWED_CAMPUSES.contains(command.campus())) {
            throw new IllegalArgumentException("캠퍼스는 인문캠퍼스 또는 자연캠퍼스만 가능해요.");
        }

        UserAccount user = new UserAccount();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(command.password()));
        user.setName(command.name().trim());
        user.setCampus(command.campus());
        user.setMajor(nullToEmpty(command.major()));
        user.setAge(nullToEmpty(command.age()));
        user.setBio(nullToEmpty(command.bio()));
        user.setInterests(sanitizeInterests(command.interests()));
        user.setSunlightScore(50);
        user.setNoShowCount(0);
        user.setParticipationCount(0);
        user.setLoginable(true);

        UserAccount saved = userAccountRepository.save(user);
        emailVerificationService.clearVerification(email);
        return UserResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public UserResponse login(String email, String password) {
        String normalizedEmail = normalize(email);
        UserAccount user = userAccountRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않아요."));

        if (!user.isLoginable() || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않아요.");
        }
        return UserResponse.from(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getByEmail(String email) {
        return UserResponse.from(require(email));
    }

    @Transactional
    public UserResponse updateProfile(String email, ProfilePatch patch) {
        UserAccount user = require(email);
        if (patch.name() != null && !patch.name().isBlank()) {
            user.setName(patch.name().trim());
        }
        if (patch.campus() != null) {
            if (!ALLOWED_CAMPUSES.contains(patch.campus())) {
                throw new IllegalArgumentException("캠퍼스는 인문캠퍼스 또는 자연캠퍼스만 가능해요.");
            }
            user.setCampus(patch.campus());
        }
        if (patch.major() != null) {
            user.setMajor(patch.major().trim());
        }
        if (patch.age() != null) {
            user.setAge(patch.age().trim());
        }
        if (patch.bio() != null) {
            user.setBio(patch.bio().trim());
        }
        if (patch.interests() != null) {
            user.setInterests(sanitizeInterests(patch.interests()));
        }
        if (patch.notificationsSeenAt() != null) {
            user.setNotificationsSeenAt(patch.notificationsSeenAt());
        }
        if (patch.avatarImage() != null) {
            String img = patch.avatarImage().trim();
            if (img.length() > 3_000_000) {
                throw new IllegalArgumentException("프로필 사진은 2MB 이하로 올려주세요.");
            }
            user.setAvatarImage(img.isEmpty() ? null : img);
        }
        return UserResponse.from(userAccountRepository.save(user));
    }

    @Transactional
    public UserResponse updateLocation(String email, double lat, double lng) {
        UserAccount user = require(email);
        user.setLastLat(lat);
        user.setLastLng(lng);
        return UserResponse.from(userAccountRepository.save(user));
    }

    private UserAccount require(String email) {
        return userAccountRepository.findByEmail(normalize(email))
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없어요."));
    }

    private static String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private static List<String> sanitizeInterests(List<String> interests) {
        if (interests == null || interests.isEmpty()) {
            return new ArrayList<>();
        }
        // Hibernate가 @ElementCollection을 merge할 때 컬렉션을 직접 clear()/add() 하므로
        // 반드시 가변 리스트여야 한다 (Stream#toList()는 불변이라 UnsupportedOperationException 발생)
        return new ArrayList<>(interests.stream()
                .filter(s -> s != null && !s.isBlank())
                .map(String::trim)
                .distinct()
                .toList());
    }

    public record SignUpCommand(
            String email,
            String password,
            String name,
            String campus,
            String major,
            String age,
            String bio,
            List<String> interests
    ) {}

    public record ProfilePatch(
            String name,
            String campus,
            String major,
            String age,
            String bio,
            List<String> interests,
            Long notificationsSeenAt,
            String avatarImage
    ) {}
}
