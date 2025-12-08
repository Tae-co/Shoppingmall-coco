package com.shoppingmallcoco.project.repository.comate;

import com.shoppingmallcoco.project.dto.comate.FollowInfoDTO;
import com.shoppingmallcoco.project.entity.auth.Member;
import com.shoppingmallcoco.project.entity.comate.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FollowRepository extends JpaRepository<Follow, Long> {
	
	// 팔로워 수
	int countByFollowing_MemNo(Long memNo);
	// 팔로잉 수
	int countByFollower_MemNo(Long memNo);

	// 팔로워 목록 조회
	@Query("SELECT new com.shoppingmallcoco.project.dto.comate.FollowInfoDTO(f.follower.memNo, f.follower.memNickname) " +
	       "FROM Follow f WHERE f.following.memNo = :memNo")
	List<FollowInfoDTO> findFollowerInfo(@Param("memNo") Long memNo);
	// 팔로잉 목록 조회
	@Query("SELECT new com.shoppingmallcoco.project.dto.comate.FollowInfoDTO(f.following.memNo, f.following.memNickname) " +
	       "FROM Follow f WHERE f.follower.memNo = :memNo")
	List<FollowInfoDTO> findFollowingInfo(@Param("memNo") Long memNo);
	
	// 팔로우 여부 확인
    boolean existsByFollowerMemNoAndFollowingMemNo(Long followerNo, Long followingNo);

    // 언팔로우
    void deleteByFollowerMemNoAndFollowingMemNo(Long followerNo, Long followingNo);
   
    /* 상품 추천 기능 구현 */
    /* 비팔로우 사용자 조회 */
    @Query("""
    		SELECT m
    		FROM Member m
    		WHERE m.memNo <> :loginUserNo
    		AND m.memNo NOT IN (
    			SELECT f.following.memNo
    			FROM Follow f
    			WHERE f.follower.memNo = :loginUserNo
    		)
    	""")
    List<Member> findNonFollowedMemNo(@Param("loginUserNo") Long loginUserNo);

    /* 자신을 제외한 모든 회원목록 */
    @Query("""
    		SELECT m 
    		FROM Member m 
    		LEFT JOIN FETCH m.skin
    		WHERE m.memNo <> :loginUserNo
    		""")
    List<Member> findAllMembersExcluding(@Param("loginUserNo") Long loginUserNo);
    
    /* 전체 회원 중 랜덤 10명 조회 (로그인한 사용자 제외) */
    @Query(value = """
            SELECT *
            FROM member
            WHERE mem_no <> :loginUserNo
            ORDER BY DBMS_RANDOM.VALUE
            FETCH FIRST 10 ROWS ONLY
            """,
            nativeQuery = true)
    List<Member> findRandomMembers(@Param("loginUserNo") Long loginUserNo);
    
    /* 전체 회원 중 랜덤 10명 조회 (로그인 하지 않은 경우) */
    @Query(value = """
            SELECT *
            FROM member
            ORDER BY DBMS_RANDOM.VALUE
            FETCH FIRST 10 ROWS ONLY
            """, 
           nativeQuery = true)
    List<Member> findRandomMembersForGuest();

}
