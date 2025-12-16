package com.shoppingmallcoco.project.service.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class GoogleService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 구글 액세스 토큰을 통한 사용자 정보 조회
    public GoogleUserInfo getUserInfo(String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());

                String googleId = jsonNode.has("sub") ? jsonNode.get("sub").asText() 
                        : (jsonNode.has("id") ? jsonNode.get("id").asText() : null);
                String email = jsonNode.has("email") ? jsonNode.get("email").asText() : null;
                String name = jsonNode.has("name") ? jsonNode.get("name").asText() : null;
                String picture = jsonNode.has("picture") ? jsonNode.get("picture").asText() : null;

                return GoogleUserInfo.builder()
                        .googleId(googleId)
                        .email(email)
                        .name(name)
                        .picture(picture)
                        .build();
            }

            throw new RuntimeException("구글 사용자 정보 조회 실패");
        } catch (Exception e) {
            throw new RuntimeException("구글 API 호출 오류: " + e.getMessage());
        }
    }

    // 구글 사용자 정보를 담는 DTO
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class GoogleUserInfo {
        private String googleId;
        private String email;
        private String name;
        private String picture;
    }
}

