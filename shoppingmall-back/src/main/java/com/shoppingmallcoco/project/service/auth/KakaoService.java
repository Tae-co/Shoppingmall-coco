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
public class KakaoService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 카카오 액세스 토큰을 통한 사용자 정보 조회
    public KakaoUserInfo getUserInfo(String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    "https://kapi.kakao.com/v2/user/me",
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                
                Long kakaoId = jsonNode.get("id").asLong();
                JsonNode properties = jsonNode.get("properties");
                JsonNode kakaoAccount = jsonNode.get("kakao_account");
                
                String nickname = properties != null && properties.has("nickname") 
                    ? properties.get("nickname").asText() 
                    : null;
                String email = kakaoAccount != null && kakaoAccount.has("email") 
                    ? kakaoAccount.get("email").asText() 
                    : null;
                String name = kakaoAccount != null && kakaoAccount.has("name") 
                    ? kakaoAccount.get("name").asText() 
                    : null;

                return KakaoUserInfo.builder()
                        .kakaoId(kakaoId)
                        .nickname(nickname)
                        .email(email)
                        .name(name)
                        .build();
            }
            
            throw new RuntimeException("카카오 사용자 정보 조회 실패");
        } catch (Exception e) {
            throw new RuntimeException("카카오 API 호출 오류: " + e.getMessage());
        }
    }

    // 카카오 사용자 정보를 담는 DTO
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class KakaoUserInfo {
        private Long kakaoId;
        private String nickname;
        private String email;
        private String name;
    }
}

