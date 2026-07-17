package com.example.myeongranghoe.service;

import com.example.myeongranghoe.domain.Funding;
import com.example.myeongranghoe.domain.UserAccount;
import com.example.myeongranghoe.repository.UserAccountRepository;
import org.springframework.stereotype.Service;

/**
 * PRD 노쇼 리스크의 규칙 기반 1차 구현.
 * 실제 AI API가 없어도 데모에서 안정적으로 같은 분석 결과를 보여준다.
 */
@Service
public class RiskAnalysisService {
    private final UserAccountRepository userAccountRepository;

    public RiskAnalysisService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    public String analyze(Funding funding) {
        int score = 0;

        int descriptionLength = safe(funding.getDescription()).length();
        if (descriptionLength >= 80) {
            score += 2;
        } else if (descriptionLength >= 30) {
            score += 1;
        } else {
            score -= 1;
        }

        if (!safe(funding.getLocationName()).isBlank()) {
            score += 1;
        }
        if (!safe(funding.getAddress()).isBlank()) {
            score += 1;
        }
        if (!safe(funding.getMeetAt()).isBlank() || !safe(funding.getMeetTimeText()).isBlank()) {
            score += 1;
        }
        if (!safe(funding.getDeadlineAt()).isBlank() || !safe(funding.getDeadlineText()).isBlank()) {
            score += 1;
        }

        UserAccount host = userAccountRepository.findByEmail(funding.getHostEmail()).orElse(null);
        if (host != null) {
            if (host.getNoShowCount() >= 3) {
                return "높음";
            }
            if (host.getNoShowCount() == 2) {
                score -= 3;
            } else if (host.getNoShowCount() == 1) {
                score -= 1;
            }

            if (host.getSunlightScore() >= 85) {
                score += 3;
            } else if (host.getSunlightScore() >= 70) {
                score += 2;
            } else if (host.getSunlightScore() >= 50) {
                score += 1;
            } else if (host.getSunlightScore() < 30) {
                score -= 2;
            } else {
                score -= 1;
            }

            if (host.getParticipationCount() >= 5) {
                score += 1;
            }
        }

        if (score >= 5) {
            return "낮음";
        }
        if (score >= 2) {
            return "중간";
        }
        return "높음";
    }

    public String buildNudgeMessage(Funding funding) {
        int remain = Math.max(0, funding.getTargetCount() - funding.currentCount());
        int current = Math.max(0, funding.currentCount());
        int target = Math.max(current, funding.getTargetCount());
        String title = safe(funding.getTitle()).isBlank() ? "이 모임" : funding.getTitle().trim();
        String category = safe(funding.getCategory()).isBlank() ? "모임" : funding.getCategory().trim();

        if (funding.isClosed()) {
            return "호스트가 모집을 마감한 펀딩이에요.";
        }
        if (funding.isMatched()) {
            return "목표 인원이 모두 모였어요. 채팅방에서 시간과 장소를 확정해보세요!";
        }
        if (remain == 0) {
            return "목표 인원이 모두 모였어요. 채팅방에서 시간과 장소를 확정해보세요!";
        }
        if (remain == 1) {
            return "딱 한 명만 더 모이면 \"" + title + "\" " + category + " 모임이 바로 성사돼요. 지금 참여하면 함께 출발할 수 있어요!";
        }
        if (remain <= 3) {
            return "현재 " + current + "/" + target + "명 참여 중이에요. 성사까지 " + remain + "명 남았으니 관심 있는 친구에게 공유해보세요!";
        }
        return "\"" + title + "\" 모집이 진행 중이에요. 비슷한 관심사의 친구들과 함께 참여해보세요.";
    }

    private static String safe(String value) {
        return value == null ? "" : value.trim();
    }
}
