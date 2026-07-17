package com.example.myeongranghoe.service;

import com.example.myeongranghoe.domain.ChatMessage;
import com.example.myeongranghoe.domain.Comment;
import com.example.myeongranghoe.domain.Funding;
import com.example.myeongranghoe.domain.Review;
import com.example.myeongranghoe.domain.UserAccount;
import com.example.myeongranghoe.domain.WishlistItem;
import com.example.myeongranghoe.repository.ChatMessageRepository;
import com.example.myeongranghoe.repository.CommentRepository;
import com.example.myeongranghoe.repository.FundingRepository;
import com.example.myeongranghoe.repository.ReviewRepository;
import com.example.myeongranghoe.repository.UserAccountRepository;
import com.example.myeongranghoe.repository.WishlistItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class CommunityService {
    private final FundingRepository fundingRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final CommentRepository commentRepository;
    private final ReviewRepository reviewRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final UserAccountRepository userAccountRepository;

    public CommunityService(
            FundingRepository fundingRepository,
            ChatMessageRepository chatMessageRepository,
            CommentRepository commentRepository,
            ReviewRepository reviewRepository,
            WishlistItemRepository wishlistItemRepository,
            UserAccountRepository userAccountRepository) {
        this.fundingRepository = fundingRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.commentRepository = commentRepository;
        this.reviewRepository = reviewRepository;
        this.wishlistItemRepository = wishlistItemRepository;
        this.userAccountRepository = userAccountRepository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listChat(Long fundingId) {
        requireFunding(fundingId);
        return chatMessageRepository.findByFundingIdOrderByCreatedAtAsc(fundingId).stream()
                .map(this::chatBody)
                .toList();
    }

    @Transactional
    public Map<String, Object> sendChat(Long fundingId, String email, String content) {
        Funding funding = requireFunding(fundingId);
        String user = normalize(email);
        if (!funding.getParticipants().contains(user) && !funding.getHostEmail().equals(user)) {
            throw new IllegalArgumentException("참여자만 채팅할 수 있어요.");
        }
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("메시지를 입력해주세요.");
        }
        ChatMessage msg = new ChatMessage();
        msg.setFundingId(fundingId);
        msg.setAuthorEmail(user);
        msg.setContent(content.trim());
        return chatBody(chatMessageRepository.save(msg));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listComments(Long fundingId) {
        requireFunding(fundingId);
        return commentRepository.findByFundingIdOrderByCreatedAtAsc(fundingId).stream()
                .map(this::commentBody)
                .toList();
    }

    @Transactional
    public Map<String, Object> addComment(Long fundingId, String email, String content, Long parentId) {
        requireFunding(fundingId);
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("댓글 내용을 입력해주세요.");
        }
        Comment comment = new Comment();
        comment.setFundingId(fundingId);
        comment.setAuthorEmail(normalize(email));
        comment.setContent(content.trim());
        comment.setParentId(parentId);
        return commentBody(commentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(Long fundingId, Long commentId, String email) {
        requireFunding(fundingId);
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없어요."));
        if (!comment.getFundingId().equals(fundingId)) {
            throw new IllegalArgumentException("이 펀딩의 댓글이 아니에요.");
        }
        if (!comment.getAuthorEmail().equals(normalize(email))) {
            throw new IllegalArgumentException("본인이 작성한 댓글만 삭제할 수 있어요.");
        }
        commentRepository.delete(comment);
    }

    @Transactional
    public Map<String, Object> submitReview(
            Long fundingId,
            String writerEmail,
            String targetEmail,
            List<String> checklist,
            String content,
            boolean noShow
    ) {
        Funding funding = requireFunding(fundingId);
        String writer = normalize(writerEmail);
        String target = normalize(targetEmail);
        if (!funding.getParticipants().contains(writer)) {
            throw new IllegalArgumentException("참여자만 후기를 작성할 수 있어요.");
        }
        if (!funding.getParticipants().contains(target)) {
            throw new IllegalArgumentException("후기 대상이 참여자가 아니에요.");
        }
        if (writer.equals(target)) {
            throw new IllegalArgumentException("자기 자신에 대한 후기는 작성할 수 없어요.");
        }
        if (reviewRepository.existsByFundingIdAndWriterEmailAndTargetEmail(fundingId, writer, target)) {
            throw new IllegalArgumentException("이미 해당 참여자에 대한 후기를 작성했어요.");
        }

        Review review = new Review();
        review.setFundingId(fundingId);
        review.setWriterEmail(writer);
        review.setTargetEmail(target);
        review.setNoShow(noShow);
        review.setChecklist(noShow || checklist == null ? List.of() : checklist);
        review.setContent(noShow || content == null ? "" : content.trim());
        Review saved = reviewRepository.save(review);

        UserAccount targetUser = userAccountRepository.findByEmail(target)
                .orElseThrow(() -> new IllegalArgumentException("후기 대상 사용자를 찾을 수 없어요."));
        if (noShow) {
            targetUser.setNoShowCount(targetUser.getNoShowCount() + 1);
            targetUser.setSunlightScore(clampSunlight(targetUser.getSunlightScore() - 20));
        } else {
            int delta = calculateReviewSunlightDelta(checklist);
            targetUser.setSunlightScore(clampSunlight(targetUser.getSunlightScore() + delta));
        }
        userAccountRepository.save(targetUser);

        return reviewBody(saved);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> reviewsForUser(String email) {
        return reviewRepository.findByTargetEmailOrderByCreatedAtDesc(normalize(email)).stream()
                .map(this::reviewBody)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> reviewsForFunding(Long fundingId) {
        requireFunding(fundingId);
        return reviewRepository.findByFundingIdOrderByCreatedAtDesc(fundingId).stream()
                .map(this::reviewBody)
                .toList();
    }

    @Transactional
    public Map<String, Object> toggleWishlist(String email, Long fundingId) {
        requireFunding(fundingId);
        String user = normalize(email);
        var existing = wishlistItemRepository.findByUserEmailAndFundingId(user, fundingId);
        boolean wishlisted;
        if (existing.isPresent()) {
            wishlistItemRepository.delete(existing.get());
            wishlisted = false;
        } else {
            WishlistItem item = new WishlistItem();
            item.setUserEmail(user);
            item.setFundingId(fundingId);
            wishlistItemRepository.save(item);
            wishlisted = true;
        }
        return Map.of("success", true, "fundingId", fundingId, "wishlisted", wishlisted);
    }

    @Transactional(readOnly = true)
    public List<Long> wishlistIds(String email) {
        return wishlistItemRepository.findByUserEmailOrderByCreatedAtDesc(normalize(email)).stream()
                .map(WishlistItem::getFundingId)
                .toList();
    }

    private Funding requireFunding(Long id) {
        return fundingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("펀딩을 찾을 수 없어요."));
    }

    private Map<String, Object> chatBody(ChatMessage msg) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("id", msg.getId());
        body.put("fundingId", msg.getFundingId());
        body.put("authorEmail", msg.getAuthorEmail());
        body.put("content", msg.getContent());
        body.put("createdAt", msg.getCreatedAt().toEpochMilli());
        return body;
    }

    private Map<String, Object> commentBody(Comment c) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("id", c.getId());
        body.put("fundingId", c.getFundingId());
        body.put("authorEmail", c.getAuthorEmail());
        body.put("content", c.getContent());
        body.put("parentId", c.getParentId());
        body.put("createdAt", c.getCreatedAt().toEpochMilli());
        return body;
    }

    private Map<String, Object> reviewBody(Review r) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("id", r.getId());
        body.put("fundingId", r.getFundingId());
        body.put("writerEmail", r.getWriterEmail());
        body.put("targetEmail", r.getTargetEmail());
        body.put("noShow", r.isNoShow());
        body.put("checklist", r.getChecklist());
        body.put("content", r.getContent());
        body.put("createdAt", r.getCreatedAt().toEpochMilli());
        return body;
    }

    private static String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private static int calculateReviewSunlightDelta(List<String> checklist) {
        if (checklist == null || checklist.isEmpty()) {
            return 0;
        }
        long checkedCount = checklist.stream()
                .filter(item -> item != null && !item.trim().isBlank())
                .count();
        return (int) Math.min(checkedCount * 2, 10);
    }

    private static int clampSunlight(int score) {
        return Math.max(0, Math.min(100, score));
    }
}
