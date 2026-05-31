package com.medora.app.service.impl;

import com.medora.app.dto.QueryDTO;
import com.medora.app.entity.Query;
import com.medora.app.exception.UserNotFoundException;
import com.medora.app.mapper.QueryMapper;
import com.medora.app.repository.QueryRepository;
import com.medora.app.service.PatientService;
import com.medora.app.service.QueryService;
import com.medora.app.service.UserService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class QueryServiceImpl implements QueryService {

    private final QueryRepository queryRepository;

    private final QueryMapper queryMapper;

    private final PatientService patientService;

    private final UserService userService;

    public QueryServiceImpl(QueryRepository queryRepository, QueryMapper queryMapper, PatientService patientService, UserService userService) {
        this.queryRepository = queryRepository;
        this.queryMapper = queryMapper;
        this.patientService = patientService;
        this.userService = userService;
    }


    @Override
    public List<QueryDTO> getAllQueries() {
        return queryRepository.findAll().stream()
                .map(query -> queryMapper.mapToDTO(query))
                .collect(Collectors.toList());
    }

    @Override
    public Query getQuery(long queryId){
        return queryRepository.findById(queryId).orElseThrow(() -> new UserNotFoundException("Query not found"));
    }

    @Override
    public List<QueryDTO> getPatientQueries() {
        long patientId=userService.getUserByUsername(SecurityContextHolder.getContext().getAuthentication().getName()).getId();
        return queryRepository.getByPatientId(patientId).stream()
                .map(query -> queryMapper.mapToDTO(query))
                .collect(Collectors.toList());
    }

    @Override
    public QueryDTO addQuery(QueryDTO queryDTO) {
        Query query=queryMapper.mapToEntity(queryDTO);
        long patientId=userService.getUserByUsername(SecurityContextHolder.getContext().getAuthentication().getName()).getId();
        query.setPatient(patientService.getPatient(patientId));
        return queryMapper.mapToDTO(queryRepository.save(query));
    }

    @Override
    public boolean deleteQuery(long queryId) {
        if(queryRepository.existsById(queryId)){
            queryRepository.deleteById(queryId);
            return true;
        }
        return false;
    }
}
