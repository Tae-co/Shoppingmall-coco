package com.shoppingmallcoco.project.service.auth;

import com.shoppingmallcoco.project.dto.auth.MemberLoginDto;
import com.shoppingmallcoco.project.dto.auth.MemberResponseDto;
import com.shoppingmallcoco.project.dto.auth.MemberSignupDto;
import com.shoppingmallcoco.project.dto.auth.MemberUpdateDto;
import com.shoppingmallcoco.project.dto.auth.FindIdDto;
import com.shoppingmallcoco.project.dto.auth.ResetPasswordDto;
import com.shoppingmallcoco.project.dto.auth.ChangePasswordDto;
import com.shoppingmallcoco.project.dto.auth.DeleteAccountDto;
import com.shoppingmallcoco.project.entity.auth.Member;
import com.shoppingmallcoco.project.repository.auth.MemberRepository;
import com.shoppingmallcoco.project.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.PageImpl;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberService {

    private final MemberRepository memberRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailVerificationService emailVerificationService;
    private final KakaoService kakaoService;
    private final NaverService naverService;
    private final GoogleService googleService;

    // 일반 회원가입 처리
    public MemberResponseDto signup(MemberSignupDto signupDto) {
        if (memberRepository.existsByMemId(signupDto.getMemId())) {
            throw new RuntimeException("이미 사용 중인 아이디입니다.");
        }

        if (memberRepository.existsByMemNickname(signupDto.getMemNickname())) {
            throw new RuntimeException("이미 사용 중인 닉네임입니다.");
        }

        if (signupDto.getMemMail() != null && !signupDto.getMemMail().isEmpty()) {
            if (memberRepository.existsByMemMail(signupDto.getMemMail())) {
                throw new RuntimeException("이미 사용 중인 이메일입니다.");
            }
        }

        String encodedPassword = passwordEncoder.encode(signupDto.getMemPwd());

        Member member = Member.toEntity(signupDto);
        member = member.toBuilder()
                .memPwd(encodedPassword)
                .role(Member.Role.USER)
                .point(0L)
                .build();

        Member savedMember = memberRepository.save(member);

        return toResponseDto(savedMember);
    }

    // 일반 로그인 처리
    @Transactional(readOnly = true)
    public MemberResponseDto login(MemberLoginDto loginDto) {
        Optional<Member> memberOpt = memberRepository.findByMemId(loginDto.getMemId());

        if (memberOpt.isEmpty()) {
            throw new RuntimeException("아이디 또는 비밀번호가 일치하지 않습니다.");
        }

        Member member = memberOpt.get();

        if (!passwordEncoder.matches(loginDto.getMemPwd(), member.getMemPwd())) {
            throw new RuntimeException("아이디 또는 비밀번호가 일치하지 않습니다.");
        }

        String token = jwtUtil.generateToken(member.getMemId(), member.getMemNo());
        MemberResponseDto response = toResponseDto(member);
        response.setToken(token);
        return response;
    }


    // 아이디 중복 확인
    @Transactional(readOnly = true)
    public boolean checkIdDuplicate(String memId) {
        return memberRepository.existsByMemId(memId);
    }

    // 닉네임 중복 확인
    @Transactional(readOnly = true)
    public boolean checkNicknameDuplicate(String memNickname) {
        return memberRepository.existsByMemNickname(memNickname);
    }

    // 이메일 중복 확인
    @Transactional(readOnly = true)
    public boolean checkEmailDuplicate(String memMail) {
        return memberRepository.existsByMemMail(memMail);
    }


    // Member Entity를 ResponseDto로 변환
    private MemberResponseDto toResponseDto(Member member) {
        return MemberResponseDto.builder()
                .memNo(member.getMemNo())
                .memId(member.getMemId())
                .memNickname(member.getMemNickname())
                .memName(member.getMemName())
                .memMail(member.getMemMail())
                .memHp(member.getMemHp())
                .memZipcode(member.getMemZipcode())
                .memAddress1(member.getMemAddress1())
                .memAddress2(member.getMemAddress2())
                .memJoindate(member.getMemJoindate())
                .role(member.getRole() != null ? member.getRole().name() : "USER")
                .point(member.getPoint() != null ? member.getPoint() : 0L)
                .build();
    }

    // 아이디 찾기용 인증번호 전송 처리
    public void sendFindIdVerificationCode(String email) {
        Optional<Member> memberOpt = memberRepository.findByMemMail(email);
        if (memberOpt.isEmpty()) {
            throw new RuntimeException("해당 이메일로 등록된 회원을 찾을 수 없습니다.");
        }

        emailVerificationService.generateVerificationCode(email);
    }

    // 아이디 찾기 인증번호 검증 및 아이디 반환
    @Transactional(readOnly = true)
    public String findId(FindIdDto findIdDto) {
        boolean isValid = emailVerificationService.verifyCode(findIdDto.getEmail(), findIdDto.getCode());
        if (!isValid) {
            throw new RuntimeException("인증번호가 일치하지 않거나 만료되었습니다.");
        }

        Member member = memberRepository.findByMemMail(findIdDto.getEmail())
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));

        return member.getMemId();
    }

    // 비밀번호 재설정용 인증번호 전송 처리
    public void sendResetPasswordVerificationCode(String memId, String email) {
        Optional<Member> memberOpt = memberRepository.findByMemId(memId);
        if (memberOpt.isEmpty()) {
            throw new RuntimeException("해당 아이디로 등록된 회원을 찾을 수 없습니다.");
        }

        Member member = memberOpt.get();

        if (member.getMemMail() == null || !member.getMemMail().equals(email)) {
            throw new RuntimeException("아이디와 이메일이 일치하지 않습니다.");
        }

        emailVerificationService.generateVerificationCode(email);
    }

    // 비밀번호 재설정 처리
    public void resetPassword(ResetPasswordDto resetPasswordDto) {
        boolean isValid = emailVerificationService.verifyCode(
                resetPasswordDto.getEmail(),
                resetPasswordDto.getCode()
        );
        if (!isValid) {
            throw new RuntimeException("인증번호가 일치하지 않거나 만료되었습니다.");
        }

        Optional<Member> memberOpt = memberRepository.findByMemId(resetPasswordDto.getMemId());
        if (memberOpt.isEmpty()) {
            throw new RuntimeException("회원을 찾을 수 없습니다.");
        }

        Member member = memberOpt.get();

        if (member.getMemMail() == null || !member.getMemMail().equals(resetPasswordDto.getEmail())) {
            throw new RuntimeException("아이디와 이메일이 일치하지 않습니다.");
        }

        String encodedPassword = passwordEncoder.encode(resetPasswordDto.getNewPassword());
        member = member.toBuilder()
                .memPwd(encodedPassword)
                .build();

        memberRepository.save(member);
    }

    // 비밀번호 변경 처리 (로그인한 사용자용)
    public void changePassword(String memId, ChangePasswordDto changePasswordDto) {
        Optional<Member> memberOpt = memberRepository.findByMemId(memId);
        if (memberOpt.isEmpty()) {
            throw new RuntimeException("회원을 찾을 수 없습니다.");
        }

        Member member = memberOpt.get();

        // 현재 비밀번호 확인
        if (!passwordEncoder.matches(changePasswordDto.getCurrentPassword(), member.getMemPwd())) {
            throw new RuntimeException("현재 비밀번호가 일치하지 않습니다.");
        }

        // 새 비밀번호가 현재 비밀번호와 같은지 확인
        if (passwordEncoder.matches(changePasswordDto.getNewPassword(), member.getMemPwd())) {
            throw new RuntimeException("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
        }

        // 새 비밀번호 길이 확인
        if (changePasswordDto.getNewPassword() == null || changePasswordDto.getNewPassword().length() < 8) {
            throw new RuntimeException("비밀번호는 8자 이상이어야 합니다.");
        }

        // 비밀번호 변경
        String encodedPassword = passwordEncoder.encode(changePasswordDto.getNewPassword());
        member = member.toBuilder()
                .memPwd(encodedPassword)
                .build();
        memberRepository.save(member);
    }

    // 계정 삭제 (로그인한 사용자)
    public void deleteAccount(String memId, DeleteAccountDto deleteAccountDto) {
        Optional<Member> memberOpt = memberRepository.findByMemId(memId);
        if (memberOpt.isEmpty()) {
            throw new RuntimeException("회원을 찾을 수 없습니다.");
        }

        Member member = memberOpt.get();

        if (deleteAccountDto.getCurrentPassword() == null || deleteAccountDto.getCurrentPassword().trim().isEmpty()) {
            throw new RuntimeException("현재 비밀번호를 입력해주세요.");
        }

        if (!passwordEncoder.matches(deleteAccountDto.getCurrentPassword(), member.getMemPwd())) {
            throw new RuntimeException("현재 비밀번호가 일치하지 않습니다.");
        }

        memberRepository.delete(member);
    }

    // 카카오 소셜 로그인 처리
    public MemberResponseDto kakaoLogin(String accessToken) {
        KakaoService.KakaoUserInfo kakaoUserInfo = kakaoService.getUserInfo(accessToken);

        String kakaoMemId = "KAKAO_" + kakaoUserInfo.getKakaoId();
        Optional<Member> memberOpt = memberRepository.findByMemId(kakaoMemId);

        Member member;
        if (memberOpt.isPresent()) {
            member = memberOpt.get();
        } else {
            String nickname = kakaoUserInfo.getNickname() != null
                    ? kakaoUserInfo.getNickname()
                    : "카카오사용자_" + kakaoUserInfo.getKakaoId();

            String finalNickname = nickname;
            int suffix = 1;
            while (memberRepository.existsByMemNickname(finalNickname)) {
                finalNickname = nickname + "_" + suffix;
                suffix++;
            }

            member = Member.builder()
                    .memId(kakaoMemId)
                    .memPwd(passwordEncoder.encode("KAKAO_" + kakaoUserInfo.getKakaoId() + "_NO_PASSWORD"))
                    .memNickname(finalNickname)
                    .memName(kakaoUserInfo.getName())
                    .memMail(kakaoUserInfo.getEmail())
                    .role(Member.Role.USER)
                    .point(0L)
                    .build();

            member = memberRepository.save(member);
        }

        String token = jwtUtil.generateToken(member.getMemId(), member.getMemNo());
        MemberResponseDto response = toResponseDto(member);
        response.setToken(token);

        boolean needsAdditionalInfo = (member.getMemMail() == null || member.getMemMail().trim().isEmpty()) ||
                (member.getMemName() == null || member.getMemName().trim().isEmpty()) ||
                (member.getMemHp() == null || member.getMemHp().trim().isEmpty());
        response.setNeedsAdditionalInfo(needsAdditionalInfo);

        return response;
    }

    // 회원 정보 업데이트 처리 (카카오 로그인 후 추가 정보 입력)
    public MemberResponseDto updateMember(Long memNo, MemberUpdateDto updateDto) {
        Member member = memberRepository.findById(memNo)
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));

        if (updateDto.getMemNickname() != null && !updateDto.getMemNickname().trim().isEmpty()
                && !updateDto.getMemNickname().equals(member.getMemNickname())) {
            if (memberRepository.existsByMemNickname(updateDto.getMemNickname())) {
                throw new RuntimeException("이미 사용 중인 닉네임입니다.");
            }
        }

        if (updateDto.getMemMail() != null && !updateDto.getMemMail().trim().isEmpty()) {
            Optional<Member> existingMember = memberRepository.findByMemMail(updateDto.getMemMail());
            if (existingMember.isPresent() && !existingMember.get().getMemNo().equals(memNo)) {
                throw new RuntimeException("이미 사용 중인 이메일입니다.");
            }
        }

        member = member.toBuilder()
                .memNickname(updateDto.getMemNickname() != null && !updateDto.getMemNickname().trim().isEmpty()
                        ? updateDto.getMemNickname()
                        : member.getMemNickname())
                .memName(updateDto.getMemName() != null ? updateDto.getMemName() : member.getMemName())
                .memMail(updateDto.getMemMail() != null ? updateDto.getMemMail() : member.getMemMail())
                .memHp(updateDto.getMemHp() != null ? updateDto.getMemHp() : member.getMemHp())
                .memZipcode(updateDto.getMemZipcode() != null ? updateDto.getMemZipcode() : member.getMemZipcode())
                .memAddress1(updateDto.getMemAddress1() != null ? updateDto.getMemAddress1() : member.getMemAddress1())
                .memAddress2(updateDto.getMemAddress2() != null ? updateDto.getMemAddress2() : member.getMemAddress2())
                .build();

        Member updatedMember = memberRepository.save(member);
        MemberResponseDto response = toResponseDto(updatedMember);
        response.setNeedsAdditionalInfo(false);
        return response;
    }

    @Transactional(readOnly = true)
    public MemberResponseDto getMemberByMemId(String memId) {
        Member member = memberRepository.findByMemId(memId)
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));
        return toResponseDto(member);
    }

    // 관리자용: 전체 회원 목록 조회 (페이징, 검색)
    @Transactional(readOnly = true)
    public Map<String, Object> getAllMembers(int page, int size, String searchTerm, String role) {
        PageRequest pageable = PageRequest.of(page - 1, size);
        
        Page<Member> memberPage;
        
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            // 검색어가 있으면 아이디, 닉네임, 이메일, 이름으로 검색
            memberPage = memberRepository.findByMemIdContainingOrMemNicknameContainingOrMemMailContainingOrMemNameContaining(
                    searchTerm, searchTerm, searchTerm, searchTerm, pageable);
        } else {
            memberPage = memberRepository.findAll(pageable);
        }
        
        // role 필터링 (Java Stream으로 필터링)
        if (role != null && !role.trim().isEmpty() && !role.equals("ALL")) {
            try {
                Member.Role roleEnum = Member.Role.valueOf(role);
                List<Member> filteredMembers = memberPage.getContent().stream()
                        .filter(m -> m.getRole() == roleEnum)
                        .collect(java.util.stream.Collectors.toList());
                
                // 필터링된 결과로 새 Page 생성
                memberPage = new PageImpl<>(
                        filteredMembers, 
                        pageable, 
                        filteredMembers.size()
                );
            } catch (IllegalArgumentException e) {
                // 잘못된 role 값이면 전체 조회
            }
        }
        
        List<MemberResponseDto> members = memberPage.getContent().stream()
                .map(this::toResponseDto)
                .collect(java.util.stream.Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("members", members);
        response.put("totalElements", memberPage.getTotalElements());
        response.put("totalPages", memberPage.getTotalPages());
        response.put("currentPage", page);
        response.put("size", size);
        
        // 통계 정보
        long totalMembers = memberRepository.count();
        long adminCount = memberRepository.countByRole(Member.Role.ADMIN);
        long userCount = memberRepository.countByRole(Member.Role.USER);
        
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalMembers", totalMembers);
        stats.put("adminCount", adminCount);
        stats.put("userCount", userCount);
        response.put("stats", stats);
        
        return response;
    }

    // 네이버 소셜 로그인 처리
    public MemberResponseDto naverLogin(String code, String state) {
        // 네이버 리다이렉트 URI
        String redirectUri = "http://localhost:3000/login/naver/callback";
        
        // 네이버 인증 코드로 액세스 토큰 받기
        String accessToken = naverService.getAccessToken(code, state, redirectUri);
        
        // 네이버 사용자 정보 조회
        NaverService.NaverUserInfo naverUserInfo = naverService.getUserInfo(accessToken);

        String naverMemId = "NAVER_" + naverUserInfo.getNaverId();
        Optional<Member> memberOpt = memberRepository.findByMemId(naverMemId);

        Member member;
        if (memberOpt.isPresent()) {
            member = memberOpt.get();
        } else {
            String nickname = naverUserInfo.getNickname() != null
                    ? naverUserInfo.getNickname()
                    : "네이버사용자_" + naverUserInfo.getNaverId();

            String finalNickname = nickname;
            int suffix = 1;
            while (memberRepository.existsByMemNickname(finalNickname)) {
                finalNickname = nickname + "_" + suffix;
                suffix++;
            }

            member = Member.builder()
                    .memId(naverMemId)
                    .memPwd(passwordEncoder.encode("NAVER_" + naverUserInfo.getNaverId() + "_NO_PASSWORD"))
                    .memNickname(finalNickname)
                    .memName(naverUserInfo.getName())
                    .memMail(naverUserInfo.getEmail())
                    .memHp(naverUserInfo.getMobile())
                    .role(Member.Role.USER)
                    .point(0L)
                    .build();

            member = memberRepository.save(member);
        }

        String token = jwtUtil.generateToken(member.getMemId(), member.getMemNo());
        MemberResponseDto response = toResponseDto(member);
        response.setToken(token);

        boolean needsAdditionalInfo = (member.getMemMail() == null || member.getMemMail().trim().isEmpty()) ||
                (member.getMemName() == null || member.getMemName().trim().isEmpty()) ||
                (member.getMemHp() == null || member.getMemHp().trim().isEmpty());
        response.setNeedsAdditionalInfo(needsAdditionalInfo);

        return response;
    }

    // 구글 소셜 로그인 처리
    public MemberResponseDto googleLogin(String accessToken) {
        // 구글 액세스 토큰으로 사용자 정보 조회
        GoogleService.GoogleUserInfo googleUserInfo = googleService.getUserInfo(accessToken);

        String googleMemId = "GOOGLE_" + googleUserInfo.getGoogleId();
        Optional<Member> memberOpt = memberRepository.findByMemId(googleMemId);

        Member member;
        if (memberOpt.isPresent()) {
            member = memberOpt.get();
        } else {
            String nickname = googleUserInfo.getName() != null
                    ? googleUserInfo.getName()
                    : "구글사용자_" + googleUserInfo.getGoogleId();

            String finalNickname = nickname;
            int suffix = 1;
            while (memberRepository.existsByMemNickname(finalNickname)) {
                finalNickname = nickname + "_" + suffix;
                suffix++;
            }

            member = Member.builder()
                    .memId(googleMemId)
                    .memPwd(passwordEncoder.encode("GOOGLE_" + googleUserInfo.getGoogleId() + "_NO_PASSWORD"))
                    .memNickname(finalNickname)
                    .memName(googleUserInfo.getName())
                    .memMail(googleUserInfo.getEmail())
                    .role(Member.Role.USER)
                    .point(0L)
                    .build();

            member = memberRepository.save(member);
        }

        String token = jwtUtil.generateToken(member.getMemId(), member.getMemNo());
        MemberResponseDto response = toResponseDto(member);
        response.setToken(token);

        boolean needsAdditionalInfo = (member.getMemMail() == null || member.getMemMail().trim().isEmpty()) ||
                (member.getMemName() == null || member.getMemName().trim().isEmpty()) ||
                (member.getMemHp() == null || member.getMemHp().trim().isEmpty());
        response.setNeedsAdditionalInfo(needsAdditionalInfo);

        return response;
    }
}

