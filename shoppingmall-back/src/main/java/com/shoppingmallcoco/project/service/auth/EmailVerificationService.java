package com.shoppingmallcoco.project.service.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

import java.util.Map;
import java.security.SecureRandom;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EmailVerificationService {

    private final JavaMailSender mailSender;

    @Value("${email.from}")
    private String fromEmail;

    @Value("${email.from-name}")
    private String fromName;

    @Value("${email.dev-mode:true}")
    private boolean devMode;

    // 인증번호 임시 저장소
    private final Map<String, VerificationCode> verificationCodes = new ConcurrentHashMap<>();
    
    // 인증번호 유효시간 설정 (5분)
    private static final long EXPIRATION_TIME = 5L * 60 * 1000;
    
    // Random 객체를 클래스 레벨의 상수로 선언하여 재사용
    private static final SecureRandom secureRandom = new SecureRandom();

    public EmailVerificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // 인증번호 생성 및 이메일 전송 처리
    public String generateVerificationCode(String email) {
    	String code = String.format("%06d", secureRandom.nextInt(1000000));
        
        verificationCodes.put(email, new VerificationCode(code, System.currentTimeMillis()));
        
        sendVerificationEmail(email, code);
        
        return code;
    }

    // 인증번호 검증 처리
    public boolean verifyCode(String email, String code) {
        VerificationCode storedCode = verificationCodes.get(email);
        
        if (storedCode == null) {
            return false;
        }
        
        if (System.currentTimeMillis() - storedCode.getTimestamp() > EXPIRATION_TIME) {
            verificationCodes.remove(email);
            return false;
        }
        
        if (storedCode.getCode().equals(code)) {
            verificationCodes.remove(email);
            return true;
        }
        
        return false;
    }

    // 이메일 전송 처리
    private void sendVerificationEmail(String email, String code) {
        if (devMode) {
            System.out.println("========================================");
            System.out.println("[이메일 발송 - 개발 모드 (무료)]");
            System.out.println("수신자: " + email);
            System.out.println("인증번호: " + code);
            System.out.println("========================================");
            return;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom(fromEmail, fromName);
            helper.setTo(email);
            helper.setSubject("[Coco] 이메일 인증번호 안내");
            
            String emailContent = 
                "안녕하세요, " + fromName + "입니다.\n\n" +
                "회원가입을 위한 이메일 인증번호는 다음과 같습니다:\n\n" +
                "인증번호: " + code + "\n\n" +
                "이 인증번호는 5분간 유효합니다.\n" +
                "인증번호를 정확히 입력해주세요.\n\n" +
                "본인이 요청한 것이 아니라면 이 이메일을 무시하세요.\n\n" +
                "감사합니다.";
            
            helper.setText(emailContent);
            
            mailSender.send(mimeMessage);
            System.out.println("[이메일 발송 성공] 수신자: " + email);
        } catch (Exception e) {
            System.err.println("[이메일 발송 실패] 수신자: " + email + ", 오류: " + e.getMessage());
            System.out.println("========================================");
            System.out.println("[이메일 발송 실패 - 콘솔 출력]");
            System.out.println("수신자: " + email);
            System.out.println("인증번호: " + code);
            System.out.println("========================================");
        }
    }

    // 인증번호 정보를 담는 내부 클래스
    private static class VerificationCode {
        private final String code;
        private final long timestamp;

        public VerificationCode(String code, long timestamp) {
            this.code = code;
            this.timestamp = timestamp;
        }

        public String getCode() {
            return code;
        }

        public long getTimestamp() {
            return timestamp;
        }
    }
}

