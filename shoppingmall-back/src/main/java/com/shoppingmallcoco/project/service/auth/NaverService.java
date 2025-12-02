package com.shoppingmallcoco.project.service.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class NaverService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${naver.client-id:}")
    private String clientId;

    @Value("${naver.client-secret:}")
    private String clientSecret;

    // 네이버 인증 코드로 액세스 토큰 받기
    public String getAccessToken(String code, String state, String redirectUri) {
        try {
            // 필수 파라미터 검증
            if (clientId == null || clientId.isEmpty()) {
                throw new RuntimeException("네이버 클라이언트 ID가 설정되지 않았습니다.");
            }
            if (clientSecret == null || clientSecret.isEmpty()) {
                throw new RuntimeException("네이버 클라이언트 시크릿이 설정되지 않았습니다.");
            }
            if (code == null || code.isEmpty()) {
                throw new RuntimeException("네이버 인증 코드가 없습니다.");
            }
            if (state == null || state.isEmpty()) {
                throw new RuntimeException("네이버 상태값이 없습니다.");
            }
            if (redirectUri == null || redirectUri.isEmpty()) {
                throw new RuntimeException("네이버 리다이렉트 URI가 없습니다.");
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("grant_type", "authorization_code");
            params.add("client_id", clientId);
            params.add("client_secret", clientSecret);
            params.add("code", code);
            params.add("state", state);
            params.add("redirect_uri", redirectUri);

            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(params, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    "https://nid.naver.com/oauth2.0/token",
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            String responseBody = response.getBody();
            
            if (response.getStatusCode().is2xxSuccessful() && responseBody != null) {
                JsonNode jsonNode = objectMapper.readTree(responseBody);
                
                // 에러 응답 확인
                if (jsonNode.has("error")) {
                    String error = jsonNode.get("error").asText();
                    String errorDescription = jsonNode.has("error_description") 
                            ? jsonNode.get("error_description").asText() 
                            : "알 수 없는 오류";
                    throw new RuntimeException("네이버 API 오류: " + error + " - " + errorDescription);
                }
                
                if (jsonNode.has("access_token")) {
                    return jsonNode.get("access_token").asText();
                } else {
                    throw new RuntimeException("네이버 응답에 액세스 토큰이 없습니다. 응답: " + responseBody);
                }
            } else {
                throw new RuntimeException("네이버 API 호출 실패. 상태 코드: " + response.getStatusCode() + ", 응답: " + responseBody);
            }
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("네이버 API 호출 오류: " + e.getMessage(), e);
        }
    }

    // 네이버 액세스 토큰을 통한 사용자 정보 조회
    public NaverUserInfo getUserInfo(String accessToken) {
        try {
            if (accessToken == null || accessToken.isEmpty()) {
                throw new RuntimeException("네이버 액세스 토큰이 없습니다.");
            }

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    "https://openapi.naver.com/v1/nid/me",
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            String responseBody = response.getBody();
            
            if (response.getStatusCode().is2xxSuccessful() && responseBody != null) {
                JsonNode jsonNode = objectMapper.readTree(responseBody);
                
                // 에러 응답 확인
                if (jsonNode.has("errorCode")) {
                    String errorCode = jsonNode.get("errorCode").asText();
                    String errorMessage = jsonNode.has("errorMessage") 
                            ? jsonNode.get("errorMessage").asText() 
                            : "알 수 없는 오류";
                    throw new RuntimeException("네이버 API 오류: " + errorCode + " - " + errorMessage);
                }
                
                JsonNode responseNode = jsonNode.get("response");

                if (responseNode != null) {
                    String naverId = responseNode.has("id") ? responseNode.get("id").asText() : null;
                    String email = responseNode.has("email") ? responseNode.get("email").asText() : null;
                    String nickname = responseNode.has("nickname") ? responseNode.get("nickname").asText() : null;
                    String name = responseNode.has("name") ? responseNode.get("name").asText() : null;
                    String mobile = responseNode.has("mobile") ? responseNode.get("mobile").asText() : null;

                    return NaverUserInfo.builder()
                            .naverId(naverId)
                            .email(email)
                            .nickname(nickname)
                            .name(name)
                            .mobile(mobile)
                            .build();
                } else {
                    throw new RuntimeException("네이버 응답에 사용자 정보가 없습니다. 응답: " + responseBody);
                }
            } else {
                throw new RuntimeException("네이버 API 호출 실패. 상태 코드: " + response.getStatusCode() + ", 응답: " + responseBody);
            }
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("네이버 API 호출 오류: " + e.getMessage(), e);
        }
    }

    // 네이버 사용자 정보를 담는 DTO
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class NaverUserInfo {
        private String naverId;
        private String email;
        private String nickname;
        private String name;
        private String mobile;
    }
}

