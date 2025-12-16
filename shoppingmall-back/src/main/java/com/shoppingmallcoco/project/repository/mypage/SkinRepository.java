package com.shoppingmallcoco.project.repository.mypage;

import com.shoppingmallcoco.project.entity.mypage.SkinProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SkinRepository extends JpaRepository<SkinProfile, Long> {
    Optional<SkinProfile> findByMember_MemNo(Long memNo);
}