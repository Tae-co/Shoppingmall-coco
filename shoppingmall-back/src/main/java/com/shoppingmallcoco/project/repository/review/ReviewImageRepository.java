package com.shoppingmallcoco.project.repository.review;

import com.shoppingmallcoco.project.entity.review.Review;
import com.shoppingmallcoco.project.entity.review.ReviewImage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewImageRepository extends JpaRepository<ReviewImage,Long> {


    List<ReviewImage> findByReview(Review review);
    void deleteByReview (Review review);
}
