package com.example.myeongranghoe.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "fundings")
public class Funding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 40)
    private String category;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(name = "location_name", nullable = false, length = 120)
    private String locationName = "";

    @Column(nullable = false, length = 255)
    private String address = "";

    @Column(nullable = false)
    private double lat;

    @Column(nullable = false)
    private double lng;

    @Column(name = "meet_at", length = 40)
    private String meetAt = "";

    @Column(name = "meet_time_text", length = 80)
    private String meetTimeText = "";

    @Column(name = "deadline_at", length = 40)
    private String deadlineAt = "";

    @Column(name = "deadline_text", length = 80)
    private String deadlineText = "";

    @Column(name = "target_count", nullable = false)
    private int targetCount;

    @Column(nullable = false)
    private int fee = 0;

    @Column(name = "filler_participants", nullable = false)
    private int fillerParticipants = 0;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "funding_participants", joinColumns = @JoinColumn(name = "funding_id"))
    @Column(name = "participant_email", nullable = false, length = 190)
    private List<String> participants = new ArrayList<>();

    @Column(nullable = false, length = 2000)
    private String description = "";

    /** 커버 이미지 (data URL 등). 클라이언트에서 2MB 제한. */
    @Lob
    @Column(name = "cover_image")
    private String coverImage;

    @Column(name = "host_email", nullable = false, length = 190)
    private String hostEmail;

    @Column(name = "ai_risk", nullable = false, length = 20)
    private String aiRisk = "낮음";

    @Column(nullable = false)
    private boolean best = false;

    @Column(name = "matched", nullable = false)
    private boolean matched = false;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public int currentCount() {
        return fillerParticipants + participants.size();
    }

    public Long getId() {
        return id;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getLocationName() {
        return locationName;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public double getLat() {
        return lat;
    }

    public void setLat(double lat) {
        this.lat = lat;
    }

    public double getLng() {
        return lng;
    }

    public void setLng(double lng) {
        this.lng = lng;
    }

    public String getMeetAt() {
        return meetAt;
    }

    public void setMeetAt(String meetAt) {
        this.meetAt = meetAt;
    }

    public String getMeetTimeText() {
        return meetTimeText;
    }

    public void setMeetTimeText(String meetTimeText) {
        this.meetTimeText = meetTimeText;
    }

    public String getDeadlineAt() {
        return deadlineAt;
    }

    public void setDeadlineAt(String deadlineAt) {
        this.deadlineAt = deadlineAt;
    }

    public String getDeadlineText() {
        return deadlineText;
    }

    public void setDeadlineText(String deadlineText) {
        this.deadlineText = deadlineText;
    }

    public int getTargetCount() {
        return targetCount;
    }

    public void setTargetCount(int targetCount) {
        this.targetCount = targetCount;
    }

    public int getFee() {
        return fee;
    }

    public void setFee(int fee) {
        this.fee = fee;
    }

    public int getFillerParticipants() {
        return fillerParticipants;
    }

    public void setFillerParticipants(int fillerParticipants) {
        this.fillerParticipants = fillerParticipants;
    }

    public List<String> getParticipants() {
        return participants;
    }

    public void setParticipants(List<String> participants) {
        this.participants = participants != null ? participants : new ArrayList<>();
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCoverImage() {
        return coverImage;
    }

    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }

    public String getHostEmail() {
        return hostEmail;
    }

    public void setHostEmail(String hostEmail) {
        this.hostEmail = hostEmail;
    }

    public String getAiRisk() {
        return aiRisk;
    }

    public void setAiRisk(String aiRisk) {
        this.aiRisk = aiRisk;
    }

    public boolean isBest() {
        return best;
    }

    public void setBest(boolean best) {
        this.best = best;
    }

    public boolean isMatched() {
        return matched;
    }

    public void setMatched(boolean matched) {
        this.matched = matched;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
