package com.example.myeongranghoe.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

/**
 * 펀딩에 사용자 사진이 없을 때, 지정 좌표 기준 지도 대표 이미지를 제공합니다.
 * 1순위: 카카오 정적 지도 (KAKAO_REST_API_KEY)
 * 2순위: OpenStreetMap 타일 (좌표 주변 맵 타일)
 */
@RestController
@RequestMapping("/api/geo")
public class GeoController {
    private static final Logger log = LoggerFactory.getLogger(GeoController.class);

    private final String kakaoRestKey;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    public GeoController(@Value("${app.kakao.rest-key:}") String kakaoRestKey) {
        this.kakaoRestKey = kakaoRestKey == null ? "" : kakaoRestKey.trim();
    }

    @GetMapping(value = "/static-map")
    public ResponseEntity<byte[]> staticMap(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "600") int width,
            @RequestParam(defaultValue = "300") int height,
            @RequestParam(defaultValue = "15") int zoom
    ) {
        int w = Math.min(Math.max(width, 80), 1024);
        int h = Math.min(Math.max(height, 80), 1024);
        int z = Math.min(Math.max(zoom, 10), 18);

        if (!kakaoRestKey.isBlank()) {
            byte[] kakao = fetchKakaoStaticMap(lat, lng, w, h);
            if (kakao != null && kakao.length > 0) {
                return imageResponse(kakao, MediaType.IMAGE_PNG);
            }
        }

        byte[] osm = fetchOsmTile(lat, lng, z);
        if (osm != null && osm.length > 0) {
            return imageResponse(osm, MediaType.IMAGE_PNG);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    private ResponseEntity<byte[]> imageResponse(byte[] body, MediaType type) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(type);
        headers.setCacheControl("public, max-age=86400");
        return new ResponseEntity<>(body, headers, HttpStatus.OK);
    }

    private byte[] fetchKakaoStaticMap(double lat, double lng, int w, int h) {
        try {
            String url = "https://dapi.kakao.com/v2/maps/staticmap"
                    + "?center=" + lng + "," + lat
                    + "&level=4"
                    + "&size=" + w + "x" + h
                    + "&map_type=ROADMAP"
                    + "&markers=" + URLEncoder.encode(
                    "color:0x2777E7|size:mid|" + lng + "," + lat,
                    StandardCharsets.UTF_8
            );
            HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(8))
                    .header("Authorization", "KakaoAK " + kakaoRestKey)
                    .GET()
                    .build();
            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return response.body();
            }
            log.warn("Kakao static map failed: HTTP {}", response.statusCode());
        } catch (Exception e) {
            log.warn("Kakao static map error: {}", e.toString());
        }
        return null;
    }

    /** 좌표가 포함된 OSM 맵 타일 1장 (대표 위치 썸네일) */
    private byte[] fetchOsmTile(double lat, double lng, int zoom) {
        try {
            int[] tile = latLngToTile(lat, lng, zoom);
            String url = "https://tile.openstreetmap.org/" + zoom + "/" + tile[0] + "/" + tile[1] + ".png";
            HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(8))
                    .header("User-Agent", "MyeongrangHoe/1.0 (campus funding; contact: local-dev)")
                    .GET()
                    .build();
            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return response.body();
            }
            log.warn("OSM tile failed: HTTP {}", response.statusCode());
        } catch (Exception e) {
            log.warn("OSM tile error: {}", e.toString());
        }
        return null;
    }

    static int[] latLngToTile(double lat, double lng, int zoom) {
        int n = 1 << zoom;
        int x = (int) Math.floor((lng + 180.0) / 360.0 * n);
        double latRad = Math.toRadians(lat);
        int y = (int) Math.floor(
                (1.0 - Math.log(Math.tan(latRad) + 1.0 / Math.cos(latRad)) / Math.PI) / 2.0 * n
        );
        x = Math.floorMod(x, n);
        y = Math.min(Math.max(y, 0), n - 1);
        return new int[]{x, y};
    }
}
