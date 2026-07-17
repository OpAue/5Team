package com.example.myeongranghoe;

import com.example.myeongranghoe.domain.Funding;
import com.example.myeongranghoe.domain.Review;
import com.example.myeongranghoe.domain.UserAccount;
import com.example.myeongranghoe.repository.ChatMessageRepository;
import com.example.myeongranghoe.repository.CommentRepository;
import com.example.myeongranghoe.repository.FundingRepository;
import com.example.myeongranghoe.repository.ReviewRepository;
import com.example.myeongranghoe.repository.UserAccountRepository;
import com.example.myeongranghoe.repository.WishlistItemRepository;
import com.example.myeongranghoe.service.CommunityService;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CommunityServiceReviewTest {

    private final FundingRepository fundingRepository = mock(FundingRepository.class);
    private final ChatMessageRepository chatMessageRepository = mock(ChatMessageRepository.class);
    private final CommentRepository commentRepository = mock(CommentRepository.class);
    private final ReviewRepository reviewRepository = mock(ReviewRepository.class);
    private final WishlistItemRepository wishlistItemRepository = mock(WishlistItemRepository.class);
    private final UserAccountRepository userAccountRepository = mock(UserAccountRepository.class);
    private final CommunityService communityService = new CommunityService(
            fundingRepository,
            chatMessageRepository,
            commentRepository,
            reviewRepository,
            wishlistItemRepository,
            userAccountRepository
    );

    @Test
    void reviewChecklistUpdatesSunlightScoreByCheckedItemCount() {
        UserAccount targetUser = targetUser(50, 0);
        prepareReview(targetUser);

        communityService.submitReview(
                1L,
                "writer@mju.ac.kr",
                "target@mju.ac.kr",
                List.of("시간 약속을 잘 지켰어요", "친절했어요", "다시 함께하고 싶어요"),
                "약속 시간도 잘 지키고 대화도 편해서 다시 함께하고 싶어요.",
                false
        );

        assertThat(targetUser.getSunlightScore()).isEqualTo(56);
        assertThat(targetUser.getNoShowCount()).isZero();
    }

    @Test
    void reviewSunlightScoreDoesNotExceedOneHundred() {
        UserAccount targetUser = targetUser(96, 0);
        prepareReview(targetUser);

        communityService.submitReview(
                1L,
                "writer@mju.ac.kr",
                "target@mju.ac.kr",
                List.of(
                        "시간 약속을 잘 지켰어요",
                        "친절했어요",
                        "분위기를 잘 만들어줬어요",
                        "다시 함께하고 싶어요",
                        "약속 장소를 잘 안내했어요"
                ),
                "모든 부분에서 만족스러운 모임이었어요.",
                false
        );

        assertThat(targetUser.getSunlightScore()).isEqualTo(100);
    }

    @Test
    void noShowReviewDecreasesSunlightScoreAndIncreasesNoShowCount() {
        UserAccount targetUser = targetUser(15, 0);
        prepareReview(targetUser);

        communityService.submitReview(
                1L,
                "writer@mju.ac.kr",
                "target@mju.ac.kr",
                List.of(),
                "",
                true
        );

        assertThat(targetUser.getSunlightScore()).isZero();
        assertThat(targetUser.getNoShowCount()).isEqualTo(1);
    }

    private void prepareReview(UserAccount targetUser) {
        Funding funding = new Funding();
        funding.setParticipants(List.of("writer@mju.ac.kr", "target@mju.ac.kr"));
        when(fundingRepository.findById(1L)).thenReturn(Optional.of(funding));
        when(reviewRepository.existsByFundingIdAndWriterEmailAndTargetEmail(
                1L,
                "writer@mju.ac.kr",
                "target@mju.ac.kr"
        )).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> savedReview(invocation.getArgument(0)));
        when(userAccountRepository.findByEmail("target@mju.ac.kr")).thenReturn(Optional.of(targetUser));
    }

    private static UserAccount targetUser(int sunlightScore, int noShowCount) {
        UserAccount user = new UserAccount();
        user.setSunlightScore(sunlightScore);
        user.setNoShowCount(noShowCount);
        return user;
    }

    private static Review savedReview(Review review) throws ReflectiveOperationException {
        Field createdAt = Review.class.getDeclaredField("createdAt");
        createdAt.setAccessible(true);
        createdAt.set(review, Instant.now());
        return review;
    }
}
