package com.medora.app.service.impl;

import com.medora.app.dto.ReviewDTO;
import com.medora.app.entity.Review;
import com.medora.app.exception.UserNotFoundException;
import com.medora.app.mapper.ReviewMapper;
import com.medora.app.repository.ReviewRepository;
import com.medora.app.service.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;

    private final DoctorService doctorService;

    private final PatientService patientService;

    private final UserService userService;

    private final ReviewMapper reviewMapper;

    public ReviewServiceImpl(ReviewRepository reviewRepository, DoctorService doctorService, PatientService patientService, UserService userService, ReviewMapper reviewMapper) {
        this.reviewRepository = reviewRepository;
        this.doctorService = doctorService;
        this.patientService = patientService;
        this.userService = userService;
        this.reviewMapper = reviewMapper;
    }

    @Override
    public ReviewDTO addReview(ReviewDTO reviewDTO, long doctorId) {
        Review review=reviewMapper.mapToEntity(reviewDTO);
        long patientId=userService.getUserByUsername(SecurityContextHolder.getContext().getAuthentication().getName()).getId();
        review.setPatient(patientService.getPatient(patientId));
        review.setDoctor(doctorService.getDoctor(doctorId));
        return reviewMapper.mapToDTO(reviewRepository.save(review));
    }

    @Override
    public ReviewDTO getReviewDTO(long reviewId){
        return reviewMapper.mapToDTO(getReview(reviewId));
    }

    @Override
    public Review getReview(long reviewId){
        return reviewRepository.findById(reviewId).orElseThrow(() -> new UserNotFoundException("Review not found"));
    }

    @Override
    public List<ReviewDTO> getAllReviews() {
        return reviewRepository.findAll().stream()
                .map(review -> reviewMapper.mapToDTO(review))
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewDTO> getDoctorReviews(long doctorId) {
        return getAllReviews().stream()
                .filter((review)->
                        review.getDoctor().getId() == doctorId)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewDTO> getPatientReviews(){
        return getAllReviews().stream()
                .filter((review)->
                        review.getPatient().getId() == userService.getUserByUsername(
                                SecurityContextHolder.getContext().getAuthentication().getName()
                        ).getId())
                .collect(Collectors.toList());
    }

    @Override
    public Boolean deleteReview(long reviewId) {
        if(reviewRepository.existsById(reviewId)){
            reviewRepository.deleteById(reviewId);
            return true;
        }
        return false;
    }

}
