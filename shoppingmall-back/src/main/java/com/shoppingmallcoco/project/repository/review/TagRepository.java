package com.shoppingmallcoco.project.repository.review;

import com.shoppingmallcoco.project.entity.review.Review;
import com.shoppingmallcoco.project.entity.review.Tag;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TagRepository extends JpaRepository<Tag, Long> {

}
