package com.shoppingmallcoco.project.repository.comate;

import com.shoppingmallcoco.project.dto.comate.FollowInfoDTO;
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


}
