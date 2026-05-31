package com.medora.app.service;

import com.medora.app.dto.QueryDTO;
import com.medora.app.entity.Query;

import java.util.List;

public interface QueryService {

    //for admin, doctor, hospital controllers
    List<QueryDTO> getAllQueries();

    // calls reply service
    Query getQuery(long queryId);

    //only for patient controller
    List<QueryDTO> getPatientQueries();
    QueryDTO addQuery(QueryDTO queryDTO);
    boolean deleteQuery(long queryId);
}
