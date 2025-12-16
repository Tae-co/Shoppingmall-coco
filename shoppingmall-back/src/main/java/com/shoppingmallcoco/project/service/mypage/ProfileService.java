package com.shoppingmallcoco.project.service.mypage;

import com.shoppingmallcoco.project.dto.mypage.SkinProfileRequestDto;
import com.shoppingmallcoco.project.dto.mypage.SkinProfileResponseDto;
import com.shoppingmallcoco.project.entity.auth.Member;
import com.shoppingmallcoco.project.entity.mypage.SkinProfile;
import com.shoppingmallcoco.project.repository.auth.MemberRepository;
import com.shoppingmallcoco.project.repository.mypage.SkinRepository;
import com.shoppingmallcoco.project.service.comate.MatchingService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final MemberRepository memberRepository;
    private final SkinRepository skinRepository;
    
    private final MatchingService matchingService;

    @Transactional
    public void updateProfile(Long memNo, SkinProfileRequestDto dto) {

        Member member = memberRepository.findById(memNo)
                .orElseThrow(() -> new IllegalArgumentException("회원 없음"));

        SkinProfile skin = skinRepository.findByMember_MemNo(memNo)
                .orElse(null);

        if (skin == null) {
            skin = new SkinProfile();
            skin.setMember(member);
        }

        // concerns 리스트가 null일 수도 있음 -> 안전하게 처리
        String concernString = (dto.getConcerns() != null && !dto.getConcerns().isEmpty())
                ? String.join(",", dto.getConcerns())
                : "";

        skin.setSkinType(dto.getSkinType());
        skin.setSkinConcern(concernString);
        skin.setPersonalColor(dto.getPersonalColor());

        skinRepository.save(skin);
        
        matchingService.invalidateCacheForUser(memNo);
    }

    @Transactional(readOnly = true)
    public SkinProfileResponseDto getProfile(Long memNo) {

        SkinProfile skin = skinRepository.findByMember_MemNo(memNo)
                .orElse(null);

        return SkinProfileResponseDto.fromEntity(skin);
    }
}
