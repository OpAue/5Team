package com.example.myeongranghoe.controller;

import com.example.myeongranghoe.config.UserContext;
import com.example.myeongranghoe.dto.UserResponse;
import com.example.myeongranghoe.service.CommunityService;
import com.example.myeongranghoe.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    private final CommunityService communityService;

    public UserController(UserService userService, CommunityService communityService) {
        this.userService = userService;
        this.communityService = communityService;
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me() {
        String email = UserContext.require();
        UserResponse user = userService.getByEmail(email);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "user", user,
                "wishlist", communityService.wishlistIds(email)
        ));
    }

    @PatchMapping("/me")
    public ResponseEntity<Map<String, Object>> updateMe(@RequestBody ProfileBody body) {
        String email = UserContext.require();
        UserResponse user = userService.updateProfile(email, new UserService.ProfilePatch(
                body.name(),
                body.campus(),
                body.major(),
                body.age(),
                body.bio(),
                body.interests(),
                body.notificationsSeenAt(),
                body.avatarImage()
        ));
        return ResponseEntity.ok(Map.of("success", true, "message", "프로필이 저장되었어요.", "user", user));
    }

    @PatchMapping("/me/location")
    public ResponseEntity<Map<String, Object>> updateLocation(@RequestBody LocationBody body) {
        String email = UserContext.require();
        if (body.lat() == null || body.lng() == null) {
            throw new IllegalArgumentException("위도·경도가 필요해요.");
        }
        UserResponse user = userService.updateLocation(email, body.lat(), body.lng());
        return ResponseEntity.ok(Map.of("success", true, "user", user));
    }

    /** 공개 프로필 (참여자 이름 표시용). 이메일 쿼리로 조회. */
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> profile(@RequestParam String email) {
        UserResponse user = userService.getByEmail(email);
        return ResponseEntity.ok(Map.of("success", true, "user", user));
    }

    @GetMapping("/reviews")
    public ResponseEntity<Map<String, Object>> reviews(@RequestParam String email) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "reviews", communityService.reviewsForUser(email)
        ));
    }

    public record ProfileBody(
            String name,
            String campus,
            String major,
            String age,
            String bio,
            List<String> interests,
            Long notificationsSeenAt,
            String avatarImage
    ) {}

    public record LocationBody(Double lat, Double lng) {}
}
