package com.shoppingmallcoco.project.service.product;

import com.shoppingmallcoco.project.dto.product.ProductSaveDTO;
import com.shoppingmallcoco.project.entity.product.*;
import com.shoppingmallcoco.project.repository.product.*;
import com.shoppingmallcoco.project.service.review.IReviewService;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.ArrayList;
import java.util.HashMap;

/**
 * 관리자 전용 상품 관리 비즈니스 로직을 담당하는 서비스 클래스
 * 상품 등록, 수정(이미지/옵션 포함), 삭제 및 대시보드 통계 기능을 제공함
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AdminProductService {

	private final ProductRepository prdRepo;
	private final ProductOptionRepository optionRepo;
	private final CategoryRepository catRepo;
	private final ProductImageRepository prdImgRepo;
	private final String uploadDir = "C:/coco/uploads/";
	private final IReviewService reviewService;

	/**
	 * API: 관리자 상품 등록
	 */
	@Transactional
	public ProductEntity createProduct(ProductSaveDTO dto, List<MultipartFile> files) throws IOException {

		// 카테고리 조회 및 상품 기본 정보 설정
		CategoryEntity category = catRepo.findById(dto.getCategoryNo())
				.orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다: " + dto.getCategoryNo()));

		ProductEntity newProduct = new ProductEntity();
		newProduct.setPrdName(dto.getPrdName());
		newProduct.setPrdPrice(dto.getPrdPrice());
		newProduct.setDescription(dto.getDescription());
		newProduct.setRegDate(LocalDate.now());
		newProduct.setCategory(category);
		newProduct.setHowToUse(dto.getHowToUse());
		newProduct.setSkinType(dto.getSkinType());
		newProduct.setSkinConcern(dto.getSkinConcern());
		newProduct.setPersonalColor(dto.getPersonalColor());
		newProduct.setStatus(dto.getStatus() != null ? dto.getStatus() : "SALE");

		// 상품 기본 정보 DB 저장
		ProductEntity savedProduct = prdRepo.save(newProduct);

		// 옵션 정보 저장
		saveOptions(savedProduct, dto.getOptions());

		// 이미지 파일 저장 및 정보 DB 저장
		saveImages(savedProduct, files);

		return savedProduct;
	}

	/**
	 * API: 관리자 상품 수정
	 */
	@Transactional
	public ProductEntity updateProduct(Long prdNo, ProductSaveDTO dto, List<MultipartFile> files) throws IOException {
		// 기존 상품 조회
		ProductEntity product = prdRepo.findById(prdNo)
				.orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다: " + prdNo));

		// 카테고리 변경 로직
		if (!product.getCategory().getCategoryNo().equals(dto.getCategoryNo())) {
			CategoryEntity newCategory = catRepo.findById(dto.getCategoryNo())
					.orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다."));
			product.setCategory(newCategory);
		}

		// 기본 정보 업데이트
		product.setPrdName(dto.getPrdName());
		product.setPrdPrice(dto.getPrdPrice());
		product.setDescription(dto.getDescription());
		product.setHowToUse(dto.getHowToUse());
		product.setSkinType(dto.getSkinType());
		product.setSkinConcern(dto.getSkinConcern());
		product.setPersonalColor(dto.getPersonalColor());

		// 판매 상태 수정
		if (dto.getStatus() != null && !dto.getStatus().isEmpty()) {
			product.setStatus(dto.getStatus());
		}

		// 옵션 수정 (기존 옵션 삭제 후 재생성 또는 업데이트)
		updateOptions(product, dto.getOptions());

		// 이미지 처리 로직 (기존 이미지 순서 변경, 삭제, 새 이미지 추가)
		processImages(product, dto.getKeptImageUrls(), files);

		return product;
	}

	/**
	 * 상품 이미지 목록을 동기화하고 순서를 재정렬하는 내부 헬퍼 메소드
	 * - 프론트엔드에서 전달받은 이미지 순서(imageOrderList)에 따라 정렬 순서(sortOrder)를 업데이트함
	 * - 목록에 없는 기존 이미지는 DB와 로컬 디스크에서 삭제함
	 * - "NEW_FILE" 마커가 있는 위치에 새 파일을 저장함
	 */
	private void processImages(ProductEntity product, List<String> imageOrderList, List<MultipartFile> newFiles)
			throws IOException {
		List<ProductImageEntity> currentImages = product.getImages();

		// 삭제 대상 이미지 선별 및 삭제
		if (currentImages != null && !currentImages.isEmpty()) {
			List<ProductImageEntity> toDelete = new ArrayList<>();
			for (ProductImageEntity img : currentImages) {
				boolean isKept = false;
				if (imageOrderList != null) {
					for (String item : imageOrderList) {
						if (img.getImageUrl().equals(item)) {
							isKept = true;
							break;
						}
					}
				}
				if (!isKept)
					toDelete.add(img);
			}

			// DB 삭제
			currentImages.removeAll(toDelete);
			prdImgRepo.deleteAll(toDelete);

			// 로컬 파일 삭제
			for (ProductImageEntity img : toDelete) {
				String fileName = img.getImageUrl().substring(img.getImageUrl().lastIndexOf("/") + 1);
				new File(uploadDir + fileName).delete();
			}
		}

		// 순서 재정렬 및 새 파일 저장
		if (imageOrderList != null) {
			int sortOrder = 1;
			int newFileIndex = 0;

			for (String item : imageOrderList) {
				if ("NEW_FILE".equals(item)) {
					// 새 파일 저장
					if (newFiles != null && newFileIndex < newFiles.size()) {
						MultipartFile file = newFiles.get(newFileIndex++);
						saveSingleImage(product, file, sortOrder++);
					}
				} else {
					// 기존 이미지 순서 업데이트
					if (currentImages != null) {
						for (ProductImageEntity img : currentImages) {
							if (img.getImageUrl().equals(item)) {
								img.setSortOrder(sortOrder++);
								break;
							}
						}
					}
				}
			}
		}
	}

	// 단일 파일 저장 로직 (UUID 파일명 생성)
	private void saveSingleImage(ProductEntity product, MultipartFile file, int sortOrder) throws IOException {
		if (file.isEmpty())	return;

		// 파일 타입 검증 (이미지 파일만 허용)
		String contentType = file.getContentType();
		if (contentType == null || !contentType.startsWith("image/")) {
			throw new IllegalArgumentException("이미지 파일만 업로드 가능합니다.");
		}
		// 허용된 이미지 타입만 허용
		List<String> allowedTypes = List.of(
			"image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
		);
		if (!allowedTypes.contains(contentType.toLowerCase())) {
			throw new IllegalArgumentException("지원하지 않는 이미지 형식입니다. (JPEG, PNG, GIF, WEBP만 허용)");
		}
		// 파일 크기 검증 (10MB 제한)
		if (file.getSize() > 10 * 1024 * 1024) {
			throw new IllegalArgumentException("파일 크기는 10MB를 초과할 수 없습니다.");
		}

		File dir = new File(uploadDir);
		if (!dir.exists())	dir.mkdirs();

		String originalFilename = file.getOriginalFilename();
		String uuid = UUID.randomUUID().toString();
		String savedFileName = uuid + "_" + originalFilename;

		File dest = new File(uploadDir + savedFileName);
		file.transferTo(dest);

		ProductImageEntity image = new ProductImageEntity();
		image.setProduct(product);
		image.setImageUrl("http://localhost:8080/images/uploads/" + savedFileName);
		image.setSortOrder(sortOrder);

		prdImgRepo.save(image);
	}

	// (신규 등록용) 단순 이미지 리스트 저장
	private void saveImages(ProductEntity product, List<MultipartFile> files) throws IOException {
		if (files == null || files.isEmpty())	return;
		
		int sortOrder = 1;
		if (product.getImages() != null) {
            sortOrder = product.getImages().size() + 1;
        }

        for (MultipartFile file : files) {
            saveSingleImage(product, file, sortOrder++);
        }
	}

	/**
	 * API: 관리자 상품 삭제 (논리적 삭제로 변경)
	 * 실제 DB에서 삭제하지 않고, '삭제됨(isDeleted=Y)' 상태로 변경함.
	 */
	public void deleteProduct(Long prdNo) {
		ProductEntity product = prdRepo.findById(prdNo).orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

		// 논리적 삭제 (isDeleted = 'Y')
		product.delete();

		// 판매 상태도 중지로 변경
		product.setStatus("STOP");
	}

	// 리뷰 수 조회 (ReviewService 위임)
	public int getReviewCount(ProductEntity product) {
		return reviewService.getReviewCount(product);
	}

	// 평균 평점 조회 (ReviewService 위임)
	public double getAverageRating(ProductEntity product) {
		return reviewService.getAverageRating(product);
	}

	// ================= 내부 헬퍼 메서드 (옵션 관련) =================

	// 옵션 신규 저장
	private void saveOptions(ProductEntity product, List<ProductSaveDTO.OptionDTO> optionDtos) {
		if (optionDtos == null)
			return;

		for (ProductSaveDTO.OptionDTO optDto : optionDtos) {
			ProductOptionEntity option = ProductOptionEntity.create(product, optDto.getOptionName(),
					optDto.getOptionValue(), optDto.getAddPrice(), optDto.getStock());
			optionRepo.save(option);
		}
	}

	// 옵션 업데이트 (기존 유지, 수정, 신규 추가, 삭제 처리)
	private void updateOptions(ProductEntity product, List<ProductSaveDTO.OptionDTO> optionDtos) {
		if (optionDtos == null)
			return;

		List<ProductOptionEntity> managedOptions = product.getOptions();

		List<Long> keepOptionIds = new ArrayList<>();

		for (ProductSaveDTO.OptionDTO dto : optionDtos) {
			if (dto.getOptionNo() != null) {
				// 기존 옵션 수정
				managedOptions.stream().filter(o -> o.getOptionNo().equals(dto.getOptionNo())).findFirst()
						.ifPresent(o -> {
							o.setOptionName(dto.getOptionName());
							o.setOptionValue(dto.getOptionValue());
							o.setAddPrice(dto.getAddPrice());
							o.setStock(dto.getStock());
							keepOptionIds.add(o.getOptionNo());
						});
			} else {
				// 신규 옵션 추가
				ProductOptionEntity newOption = ProductOptionEntity.create(product, dto.getOptionName(),
						dto.getOptionValue(), dto.getAddPrice(), dto.getStock());
				managedOptions.add(newOption);
			}
		}

		// 요청에 포함되지 않은 기존 옵션은 삭제
		managedOptions
				.removeIf(option -> option.getOptionNo() != null && !keepOptionIds.contains(option.getOptionNo()));
	}

	/**
	 * API: 관리자 대시보드 통계 조회
	 */
	@Transactional(readOnly = true)
	public Map<String, Long> getDashboardStats() {
		Map<String, Long> stats = new HashMap<>();

		// 전체 상품 수
		long totalProducts = prdRepo.count();
		// 판매중 상품 수 (DB값이 "SALE"인 것)
		long inStockProducts = prdRepo.countByStatus("SALE");
		// 품절 상품 수 (DB값이 "SOLD_OUT"인 것)
		long outOfStockProducts = prdRepo.countByStatus("SOLD_OUT");
		// 총 재고 수량 (옵션 테이블의 stock 총합)
		long totalStock = optionRepo.sumTotalStock();

		stats.put("totalProducts", totalProducts);
		stats.put("inStockProducts", inStockProducts);
		stats.put("outOfStockProducts", outOfStockProducts);
		stats.put("totalStock", totalStock);

		return stats;
	}
}