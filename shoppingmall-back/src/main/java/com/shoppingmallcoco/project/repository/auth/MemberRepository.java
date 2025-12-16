package com.shoppingmallcoco.project.repository.auth;

import com.shoppingmallcoco.project.entity.auth.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    // 아이디로 회원 찾기
    Optional<Member> findByMemId(String memId);

    // 이메일로 회원 찾기
    Optional<Member> findByMemMail(String memMail);

    // 아이디 중복 확인
    boolean existsByMemId(String memId);

    // 닉네임 중복 확인
    boolean existsByMemNickname(String memNickname);

    // 이메일 중복 확인
    boolean existsByMemMail(String memMail);

    // 검색: 아이디, 닉네임, 이메일, 이름으로 검색
    Page<Member> findByMemIdContainingOrMemNicknameContainingOrMemMailContainingOrMemNameContaining(
            String memId, String memNickname, String memMail, String memName, Pageable pageable);
    
    // 검색: 닉네임으로만 검색
    List<Member> findByMemNicknameContainingIgnoreCase(String memNickname);

    // role별 회원 수 조회
    long countByRole(Member.Role role);
    
    // 최근 가입 유저
    @Query("""
        SELECT m
        FROM Member m
        ORDER BY m.memJoindate DESC
    """)
    List<Member> findRecentUsers(Pageable pageable);
    
    // 리뷰를 많이 작성한 유저 조회
    @Query("""
        SELECT m
        FROM Member m
        LEFT JOIN Review r ON r.orderItem.order.member.memNo = m.memNo
        GROUP BY m
        ORDER BY COUNT(r) DESC
    """)
    List<Member> findUsersOrderByReviewCount(Pageable pageable);

}


