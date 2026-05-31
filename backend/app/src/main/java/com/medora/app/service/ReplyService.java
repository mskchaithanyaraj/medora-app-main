package com.medora.app.service;

import com.medora.app.dto.ReplyDTO;

import java.util.List;

public interface ReplyService {

    // for all users
    List<ReplyDTO> getQueryReplies(long queryId);

    // all users except patient
    ReplyDTO addReply(ReplyDTO replyDTO, long queryId);
    boolean deleteReply(long replyId);

}
