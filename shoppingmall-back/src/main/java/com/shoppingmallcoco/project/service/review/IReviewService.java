package com.shoppingmallcoco.project.service.review;

import com.shoppingmallcoco.project.entity.product.ProductEntity;

public interface IReviewService {

	    // 상품(Entity)을 받아서 총 리뷰 개수를 반환
	    int getReviewCount(ProductEntity product);
	    
	    // 상품(Entity)을 받아서 평균 평점을 반환
	    double getAverageRating(ProductEntity product);
	    
	    // (리뷰 구현 코드를 작성)
}
