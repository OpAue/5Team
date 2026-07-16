package com.example.myeongranghoe.dto;

import com.example.myeongranghoe.domain.Funding;

import java.util.List;

public record FundingResponse(
        Long id,
        String category,
        String title,
        String locationName,
        String address,
        double lat,
        double lng,
        String meetAt,
        String meetTimeText,
        String deadlineAt,
        String deadlineText,
        int targetCount,
        int fee,
        int fillerParticipants,
        List<String> participants,
        int currentCount,
        String description,
        String coverImage,
        String hostEmail,
        String aiRisk,
        boolean best,
        boolean matched,
        boolean closed,
        boolean scheduleConfirmed,
        long createdAt,
        Double distanceKm
) {
    public static FundingResponse from(Funding f) {
        return from(f, null);
    }

    public static FundingResponse from(Funding f, Double distanceKm) {
        return new FundingResponse(
                f.getId(),
                f.getCategory(),
                f.getTitle(),
                f.getLocationName(),
                f.getAddress(),
                f.getLat(),
                f.getLng(),
                f.getMeetAt() == null ? "" : f.getMeetAt(),
                f.getMeetTimeText() == null ? "" : f.getMeetTimeText(),
                f.getDeadlineAt() == null ? "" : f.getDeadlineAt(),
                f.getDeadlineText() == null ? "" : f.getDeadlineText(),
                f.getTargetCount(),
                f.getFee(),
                f.getFillerParticipants(),
                List.copyOf(f.getParticipants()),
                f.currentCount(),
                f.getDescription(),
                f.getCoverImage() == null ? "" : f.getCoverImage(),
                f.getHostEmail(),
                f.getAiRisk(),
                f.isBest(),
                f.isMatched(),
                f.isClosed(),
                f.isScheduleConfirmed(),
                f.getCreatedAt() == null ? 0L : f.getCreatedAt().toEpochMilli(),
                distanceKm
        );
    }
}
