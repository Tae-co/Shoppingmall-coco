package com.shoppingmallcoco.project;

import com.shoppingmallcoco.project.filter.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class WebSecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Value("${cors.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
			// 토큰 기반 인증이므로 CSRF 보호는 비활성화
			.csrf(csrf -> csrf.disable())
			// CORS 설정을 커스터마이징된 설정으로 등록
			.cors(cors -> cors.configurationSource(corsConfigurationSource()))
			// 기본 로그인 폼은 사용하지 않음 (프론트엔드에서 처리)
			.formLogin(formLogin -> formLogin.disable())
			// 서버가 세션을 생성하지 않도록 설정 (STATELESS)
			.sessionManagement(session -> session
				.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
			)
			.authorizeHttpRequests(auth -> auth
				// 인증 없이 접근 가능한 회원 관련 공개 API
				.requestMatchers(
					"/api/member/signup",
					"/api/member/login",
					"/api/member/kakao/**",
					"/api/member/naver/**",
					"/api/member/google/**",
					"/api/member/check-id/**",
					"/api/member/check-nickname/**",
					"/api/member/check-email/**",
					"/api/member/email/**",
					"/api/member/find-id/**",
					"/api/member/find-password/**",
					"/api/member/reset-password",
					"/images/**"
				).permitAll()
				// 인증 없이 접근 가능한 리뷰 조회 API (GET만 허용)
				.requestMatchers(HttpMethod.GET, "/api/reviews/*").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/products/*/reviews").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/products/*/countReviews/*").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/review/*/check").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/products/*/reviewPages").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/tags").permitAll()
				// 로그인된 사용자만 접근할 수 있는 리뷰 관련 API
				.requestMatchers(HttpMethod.POST, "/api/reviews").authenticated()
				.requestMatchers(HttpMethod.PUT, "/api/reviews/*").authenticated()
				.requestMatchers(HttpMethod.DELETE, "/api/reviews/*").authenticated()
				.requestMatchers(HttpMethod.POST, "/api/reviews/*/like").authenticated()
				.requestMatchers(HttpMethod.GET, "/api/reviews/*/getOrderItemNo").authenticated()
				// 로그인된 사용자만 접근할 수 있는 회원 관련 API
				.requestMatchers(
					"/api/member/me", 
					"/api/member/update", 
					"/api/member/change-password", 
					"/api/member/delete",
					"/api/mypage"
				).authenticated()
				// 로그인된 사용자만 접근할 수 있는 장바구니 및 프로필 API
				.requestMatchers("/api/coco/members/**").authenticated()
				// 주문 관련 API는 인증 필요
				.requestMatchers("/api/orders/**").authenticated()
				// Comate 관련 API - 조회는 공개, 작성/수정/삭제는 인증 필요
				.requestMatchers(HttpMethod.GET, "/api/comate/**").permitAll()
				.requestMatchers(HttpMethod.POST, "/api/comate/**").authenticated()
				.requestMatchers(HttpMethod.DELETE, "/api/comate/**").authenticated()
				// 관리자만 접근할 수 있는 API
				.requestMatchers("/api/member/admin/**").authenticated()
				.requestMatchers("/api/admin/**").authenticated()
				// 상품 유사 피부 타입 통계는 인증 필요 (개인정보 포함)
				.requestMatchers(HttpMethod.GET, "/api/products/*/similar-skin-tags").authenticated()
				// 상품 조회는 공개 (위의 인증 필요한 엔드포인트 제외)
				.requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/categories").permitAll()
				// 나머지 요청은 모두 허용
                .anyRequest().permitAll()
			)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
			// 보안 헤더 설정
			.headers(headerConfig -> headerConfig
				.frameOptions(frameOptionsConfig -> frameOptionsConfig.deny())
				.contentTypeOptions(contentTypeOptionsConfig -> contentTypeOptionsConfig.disable())
				.httpStrictTransportSecurity(hstsConfig -> hstsConfig.disable())
			);
		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		// 프론트엔드 도메인에 대해 교차 출처 요청을 허용
		CorsConfiguration configuration = new CorsConfiguration();
		
		// 환경 변수에서 허용할 오리진 목록 가져오기 (쉼표로 구분)
		List<String> origins = Arrays.asList(allowedOrigins.split(","));
		configuration.setAllowedOrigins(origins);
		
		// REST API에서 사용하는 HTTP 메서드를 허용
		configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
		
		// 필요한 헤더만 명시적으로 허용 (보안 강화)
		configuration.setAllowedHeaders(Arrays.asList(
			"Authorization",
			"Content-Type",
			"X-Requested-With",
			"Accept",
			"Origin"
		));
		
		// 자격 증명(쿠키, 인증 헤더 등)을 포함한 요청 허용
		configuration.setAllowCredentials(true);
		
		// Preflight 요청 캐시 시간 설정 (초 단위)
		configuration.setMaxAge(3600L);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	@Bean
	public BCryptPasswordEncoder passwordEncoder() {
		// 회원 비밀번호를 암호화하기 위한 BCryptPasswordEncoder Bean 등록
		return new BCryptPasswordEncoder();
	}
}
