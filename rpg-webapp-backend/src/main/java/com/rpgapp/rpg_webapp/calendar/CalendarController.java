package com.rpgapp.rpg_webapp.calendar;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.rpgapp.rpg_webapp.calendar.dto.ProposeSessionRequestDTO;
import com.rpgapp.rpg_webapp.calendar.dto.SessionProposalDTO;
import com.rpgapp.rpg_webapp.calendar.dto.VoteRequestDTO;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/campaign/{campaignId}/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @PostMapping("/propose")
    public SessionProposalDTO propose(
            @PathVariable Long campaignId,
            @RequestBody ProposeSessionRequestDTO req,
             Long userId  
    ) {
        var proposal = calendarService.proposeSession(
                campaignId,
                req.dateTimeUtc(),
                userId
        );
        return SessionProposalDTO.from(proposal);  
    }

    @PostMapping("/{proposalId}/vote")
    public SessionProposalDTO vote(
            @PathVariable Long campaignId,
            @PathVariable Long proposalId,
            @RequestBody VoteRequestDTO req

    ) {
        var proposal = calendarService.vote(
                proposalId,
                req.userId(),
                req.vote()
        );
        return SessionProposalDTO.from(proposal);
    }


}
