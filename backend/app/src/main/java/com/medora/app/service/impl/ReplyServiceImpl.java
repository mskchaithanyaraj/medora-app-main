package com.medora.app.service.impl;

import com.medora.app.dto.ReplyDTO;
import com.medora.app.entity.Query;
import com.medora.app.entity.Reply;
import com.medora.app.entity.User;
import com.medora.app.mapper.ReplyMapper;
import com.medora.app.repository.ReplyRepository;
import com.medora.app.service.QueryService;
import com.medora.app.service.ReplyService;
import com.medora.app.service.UserService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReplyServiceImpl implements ReplyService {

    private final ReplyRepository replyRepository;

    private final ReplyMapper replyMapper;

    private final UserService userService;

    private final QueryService queryService;

    public ReplyServiceImpl(ReplyRepository replyRepository, ReplyMapper replyMapper, UserService userService, QueryService queryService) {
        this.replyRepository = replyRepository;
        this.replyMapper = replyMapper;
        this.userService = userService;
        this.queryService = queryService;
    }


    @Override
    public List<ReplyDTO> getQueryReplies(long queryId) {
        return replyRepository.getByQueryId(queryId).stream()
                .map(reply -> replyMapper.mapToDTO(reply))
                .collect(Collectors.toList());
    }

    @Override
    public ReplyDTO addReply(ReplyDTO replyDTO, long queryId) {
        Reply reply=replyMapper.mapToEntity(replyDTO);
        User user=userService.getUserByUsername(SecurityContextHolder.getContext().getAuthentication().getName());
        Query query=queryService.getQuery(queryId);
        reply.setRepliedUser(user);
        reply.setQuery(query);
        return replyMapper.mapToDTO(replyRepository.save(reply));
    }

    @Override
    public boolean deleteReply(long replyId) {
        if(replyRepository.existsById(replyId)){
            replyRepository.deleteById(replyId);
            return true;
        }
        return false;
    }
}
