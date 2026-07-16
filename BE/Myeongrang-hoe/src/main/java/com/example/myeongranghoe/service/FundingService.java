package com.example.myeongranghoe.service;

import com.example.myeongranghoe.domain.ChatMessage;
import com.example.myeongranghoe.domain.Funding;
import com.example.myeongranghoe.domain.UserAccount;
import com.example.myeongranghoe.dto.FundingResponse;
import com.example.myeongranghoe.repository.ChatMessageRepository;
import com.example.myeongranghoe.repository.FundingRepository;
import com.example.myeongranghoe.repository.UserAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
public class FundingService {
    private final FundingRepository fundingRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserAccountRepository userAccountRepository;
    private final RiskAnalysisService riskAnalysisService;

    public FundingService(
            FundingRepository fundingRepository,
            ChatMessageRepository chatMessageRepository,
            UserAccountRepository userAccountRepository,
            RiskAnalysisService riskAnalysisService) {
        this.fundingRepository = fundingRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.userAccountRepository = userAccountRepository;
        this.riskAnalysisService = riskAnalysisService;
    }

    @Transactional(readOnly = true)
    public List<FundingResponse> listAll() {
        return fundingRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(FundingResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FundingResponse> listNearby(double lat, double lng, double radiusKm) {
        return fundingRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(f -> {
                    double d = GeoUtils.distanceKm(lat, lng, f.getLat(), f.getLng());
                    return FundingResponse.from(f, d);
                })
                .filter(r -> r.distanceKm() != null && r.distanceKm() <= radiusKm)
                .sorted(Comparator.comparing(FundingResponse::distanceKm))
                .toList();
    }

    @Transactional(readOnly = true)
    public FundingResponse get(Long id) {
        return FundingResponse.from(require(id));
    }

    @Transactional
    public FundingResponse create(String hostEmail, FundingCommand cmd) {
        validateCommand(cmd);
        String host = normalize(hostEmail);
        Funding funding = new Funding();
        applyCommand(funding, cmd);
        funding.setHostEmail(host);
        List<String> participants = new ArrayList<>();
        participants.add(host);
        funding.setParticipants(participants);
        funding.setFillerParticipants(0);
        funding.setMatched(false);
        funding.setAiRisk(riskAnalysisService.analyze(funding));
        Funding saved = fundingRepository.save(funding);

        addSystemChat(saved.getId(), hostName(host) + "님이 채팅방을 개설했습니다");
        return FundingResponse.from(saved);
    }

    @Transactional
    public FundingResponse update(Long id, String actorEmail, FundingCommand cmd) {
        Funding funding = require(id);
        if (!funding.getHostEmail().equals(normalize(actorEmail))) {
            throw new IllegalArgumentException("호스트만 수정할 수 있어요.");
        }
        validateCommand(cmd);
        int minTarget = funding.currentCount();
        applyCommand(funding, cmd);
        if (funding.getTargetCount() < minTarget) {
            funding.setTargetCount(minTarget);
        }
        funding.setAiRisk(riskAnalysisService.analyze(funding));
        refreshMatched(funding);
        return FundingResponse.from(fundingRepository.save(funding));
    }

    @Transactional
    public FundingResponse join(Long id, String email) {
        Funding funding = require(id);
        String user = normalize(email);
        if (funding.getParticipants().contains(user)) {
            return FundingResponse.from(funding);
        }
        if (funding.isClosed()) {
            throw new IllegalArgumentException("호스트가 모집을 마감한 펀딩이에요.");
        }
        if (funding.isMatched() || funding.currentCount() >= funding.getTargetCount()) {
            throw new IllegalArgumentException("이미 모집이 마감된 펀딩이에요.");
        }
        funding.getParticipants().add(user);
        UserAccount account = userAccountRepository.findByEmail(user).orElse(null);
        if (account != null) {
            account.setParticipationCount(account.getParticipationCount() + 1);
            userAccountRepository.save(account);
        }
        addSystemChat(funding.getId(), hostName(user) + "님이 참여하셨습니다");
        refreshMatched(funding);
        return FundingResponse.from(fundingRepository.save(funding));
    }

    @Transactional
    public FundingResponse leave(Long id, String email) {
        Funding funding = require(id);
        String user = normalize(email);
        if (funding.getHostEmail().equals(user)) {
            throw new IllegalArgumentException("호스트는 나갈 수 없어요.");
        }
        funding.getParticipants().remove(user);
        funding.setMatched(funding.currentCount() >= funding.getTargetCount());
        return FundingResponse.from(fundingRepository.save(funding));
    }

    @Transactional
    public FundingResponse confirm(Long id, String hostEmail) {
        Funding funding = require(id);
        if (!funding.getHostEmail().equals(normalize(hostEmail))) {
            throw new IllegalArgumentException("호스트만 모집을 확정할 수 있어요.");
        }
        if (funding.isClosed()) {
            throw new IllegalArgumentException("이미 마감된 펀딩이에요.");
        }
        int current = funding.currentCount();
        if (current < 2) {
            throw new IllegalArgumentException("혼자일 때는 모집을 확정할 수 없어요.");
        }
        funding.setTargetCount(current);
        funding.setMatched(true);
        addSystemChat(funding.getId(), "호스트가 현재 인원으로 모집을 확정했어요. 채팅으로 일정을 맞춰보세요!");
        return FundingResponse.from(fundingRepository.save(funding));
    }

    /** 호스트 조기 마감 (참여 불가, 목록에는 남김) */
    @Transactional
    public FundingResponse close(Long id, String hostEmail) {
        Funding funding = require(id);
        if (!funding.getHostEmail().equals(normalize(hostEmail))) {
            throw new IllegalArgumentException("호스트만 모집을 마감할 수 있어요.");
        }
        funding.setClosed(true);
        funding.setMatched(true);
        addSystemChat(funding.getId(), "호스트가 모집을 마감했어요.");
        return FundingResponse.from(fundingRepository.save(funding));
    }

    /** 호스트 펀딩 삭제 */
    @Transactional
    public void delete(Long id, String hostEmail) {
        Funding funding = require(id);
        if (!funding.getHostEmail().equals(normalize(hostEmail))) {
            throw new IllegalArgumentException("호스트만 삭제할 수 있어요.");
        }
        fundingRepository.delete(funding);
    }

    /** 성사 후 만남 일정 확정 */
    @Transactional
    public FundingResponse confirmSchedule(Long id, String hostEmail, ScheduleCommand cmd) {
        Funding funding = require(id);
        if (!funding.getHostEmail().equals(normalize(hostEmail))) {
            throw new IllegalArgumentException("호스트만 일정을 확정할 수 있어요.");
        }
        if (!funding.isMatched() && funding.currentCount() < funding.getTargetCount()) {
            throw new IllegalArgumentException("모집이 성사된 뒤에 일정을 확정할 수 있어요.");
        }
        if (cmd.meetAt() != null && !cmd.meetAt().isBlank()) {
            funding.setMeetAt(cmd.meetAt().trim());
        }
        if (cmd.meetTimeText() != null && !cmd.meetTimeText().isBlank()) {
            funding.setMeetTimeText(cmd.meetTimeText().trim());
        }
        if (cmd.locationName() != null && !cmd.locationName().isBlank()) {
            funding.setLocationName(cmd.locationName().trim());
        }
        if (cmd.address() != null) {
            funding.setAddress(cmd.address().trim());
        }
        if (cmd.lat() != null) {
            funding.setLat(cmd.lat());
        }
        if (cmd.lng() != null) {
            funding.setLng(cmd.lng());
        }
        funding.setMatched(true);
        funding.setScheduleConfirmed(true);
        String place = funding.getLocationName().isBlank() ? "장소 미정" : funding.getLocationName();
        String when = funding.getMeetTimeText().isBlank() ? "시간 미정" : funding.getMeetTimeText();
        addSystemChat(funding.getId(), "만남 일정이 확정됐어요 · " + when + " · " + place);
        return FundingResponse.from(fundingRepository.save(funding));
    }

    @Transactional(readOnly = true)
    public String nudgeMessage(Long id) {
        return riskAnalysisService.buildNudgeMessage(require(id));
    }

    private void refreshMatched(Funding funding) {
        boolean matched = funding.currentCount() >= funding.getTargetCount();
        if (matched && !funding.isMatched()) {
            addSystemChat(funding.getId(), "목표 인원이 달성되어 모임이 성사됐어요! 🎉");
        }
        funding.setMatched(matched);
    }

    private void addSystemChat(Long fundingId, String content) {
        ChatMessage msg = new ChatMessage();
        msg.setFundingId(fundingId);
        msg.setAuthorEmail("system");
        msg.setContent(content);
        chatMessageRepository.save(msg);
    }

    private String hostName(String email) {
        return userAccountRepository.findByEmail(email)
                .map(UserAccount::getName)
                .filter(n -> n != null && !n.isBlank())
                .orElse("누군가");
    }

    private Funding require(Long id) {
        return fundingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("펀딩을 찾을 수 없어요."));
    }

    private void validateCommand(FundingCommand cmd) {
        if (cmd.title() == null || cmd.title().isBlank()) {
            throw new IllegalArgumentException("제목은 필수입니다.");
        }
        if (cmd.targetCount() < 2) {
            throw new IllegalArgumentException("목표 인원은 2명 이상이어야 해요.");
        }
        if (cmd.category() == null || cmd.category().isBlank()) {
            throw new IllegalArgumentException("카테고리는 필수입니다.");
        }
    }

    private void applyCommand(Funding funding, FundingCommand cmd) {
        funding.setCategory(cmd.category().trim());
        funding.setTitle(cmd.title().trim());
        funding.setDescription(nullToEmpty(cmd.description()));
        funding.setAddress(nullToEmpty(cmd.address()));
        funding.setLocationName(nullToEmpty(cmd.locationName()));
        funding.setLat(cmd.lat());
        funding.setLng(cmd.lng());
        funding.setMeetAt(nullToEmpty(cmd.meetAt()));
        funding.setMeetTimeText(nullToEmpty(cmd.meetTimeText()));
        funding.setDeadlineAt(nullToEmpty(cmd.deadlineAt()));
        funding.setDeadlineText(nullToEmpty(cmd.deadlineText()));
        funding.setTargetCount(cmd.targetCount());
        funding.setFee(Math.max(0, cmd.fee()));
        // 빈 문자열이면 기존 이미지 유지(수정 시 null 만 명시 삭제로 쓸 수 있음) — 생성/수정 모두 전달값 반영
        if (cmd.coverImage() != null) {
            String img = cmd.coverImage().trim();
            // 대략 2.8MB base64 상한 (원본 2MB 내외)
            if (img.length() > 3_000_000) {
                throw new IllegalArgumentException("이미지 용량이 너무 커요. 2MB 이하로 올려주세요.");
            }
            funding.setCoverImage(img.isEmpty() ? null : img);
        }
    }

    private static String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    public record FundingCommand(
            String category,
            String title,
            String description,
            String address,
            String locationName,
            double lat,
            double lng,
            String meetAt,
            String meetTimeText,
            String deadlineAt,
            String deadlineText,
            int targetCount,
            int fee,
            String coverImage
    ) {}

    public record ScheduleCommand(
            String meetAt,
            String meetTimeText,
            String locationName,
            String address,
            Double lat,
            Double lng
    ) {}
}
