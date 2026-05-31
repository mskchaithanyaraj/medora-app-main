package com.medora.app.service;

import com.medora.app.dto.ReviewDTO;
import com.medora.app.entity.Review;

import java.util.List;

public interface ReviewService {
    ReviewDTO addReview(ReviewDTO reviewDTO, long doctorId);

    ReviewDTO getReviewDTO(long reviewId);

    Review getReview(long reviewId);

    List<ReviewDTO> getAllReviews();

    //for doctor, patient controllers
    List<ReviewDTO> getDoctorReviews(long doctorId);

    List<ReviewDTO> getPatientReviews();

    Boolean deleteReview(long reviewId);
}
