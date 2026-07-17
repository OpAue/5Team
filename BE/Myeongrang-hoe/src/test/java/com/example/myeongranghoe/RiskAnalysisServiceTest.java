package com.example.myeongranghoe;

import com.example.myeongranghoe.domain.Funding;
import com.example.myeongranghoe.domain.UserAccount;
import com.example.myeongranghoe.repository.UserAccountRepository;
import com.example.myeongranghoe.service.RiskAnalysisService;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RiskAnalysisServiceTest {

    private final UserAccountRepository userAccountRepository = mock(UserAccountRepository.class);
    private final RiskAnalysisService riskAnalysisService = new RiskAnalysisService(userAccountRepository);

    @Test
    void detailedFundingFromTrustedHostHasLowRisk() {
        Funding funding = baseFunding();
        funding.setDescription("처음 만나는 분도 편하게 오실 수 있도록 메뉴, 예상 비용, 이동 동선까지 자세히 적은 맛집 모임입니다.");
        funding.setLocationName("명지대 인문캠 정문");
        funding.setAddress("서울 서대문구 거북골로 34");
        funding.setMeetAt("2026-07-17T18:00");
        funding.setDeadlineText("오늘 오후 5시 마감");

        UserAccount host = new UserAccount();
        host.setSunlightScore(88);
        host.setNoShowCount(0);
        host.setParticipationCount(6);
        when(userAccountRepository.findByEmail("host@mju.ac.kr")).thenReturn(Optional.of(host));

        assertThat(riskAnalysisService.analyze(funding)).isEqualTo("낮음");
    }

    @Test
    void repeatedNoShowHostHasHighRisk() {
        Funding funding = baseFunding();
        funding.setDescription("같이 갈 사람 구합니다.");

        UserAccount host = new UserAccount();
        host.setSunlightScore(90);
        host.setNoShowCount(3);
        when(userAccountRepository.findByEmail("host@mju.ac.kr")).thenReturn(Optional.of(host));

        assertThat(riskAnalysisService.analyze(funding)).isEqualTo("높음");
    }

    @Test
    void nudgeMessageHighlightsOneSeatLeft() {
        Funding funding = baseFunding();
        funding.setTitle("성수 오마카세");
        funding.setCategory("맛집");
        funding.setTargetCount(4);
        funding.setParticipants(List.of("host@mju.ac.kr", "a@mju.ac.kr", "b@mju.ac.kr"));

        assertThat(riskAnalysisService.buildNudgeMessage(funding))
                .contains("딱 한 명")
                .contains("성수 오마카세")
                .contains("맛집");
    }

    private static Funding baseFunding() {
        Funding funding = new Funding();
        funding.setHostEmail("host@mju.ac.kr");
        funding.setTitle("명랑회 모임");
        funding.setCategory("맛집");
        funding.setTargetCount(4);
        funding.setParticipants(List.of("host@mju.ac.kr"));
        return funding;
    }
}
