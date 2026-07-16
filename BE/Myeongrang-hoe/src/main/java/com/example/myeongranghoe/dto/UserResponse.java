package com.example.myeongranghoe.dto;

import com.example.myeongranghoe.domain.UserAccount;

import java.util.List;

public record UserResponse(
        Long id,
        String email,
        String name,
        String campus,
        String major,
        String age,
        String bio,
        List<String> interests,
        int sunlightScore,
        int noShowCount,
        int participationCount,
        boolean loginable,
        Double lastLat,
        Double lastLng,
        long notificationsSeenAt,
        String avatarImage
) {
    public static UserResponse from(UserAccount user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getCampus(),
                user.getMajor(),
                user.getAge(),
                user.getBio(),
                List.copyOf(user.getInterests()),
                user.getSunlightScore(),
                user.getNoShowCount(),
                user.getParticipationCount(),
                user.isLoginable(),
                user.getLastLat(),
                user.getLastLng(),
                user.getNotificationsSeenAt(),
                user.getAvatarImage() == null ? "" : user.getAvatarImage()
        );
    }
}
