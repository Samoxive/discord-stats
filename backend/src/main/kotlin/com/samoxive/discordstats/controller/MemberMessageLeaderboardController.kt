package com.samoxive.discordstats.controller

import com.samoxive.discordstats.controller.response.*
import com.samoxive.discordstats.service.MessageService
import net.dv8tion.jda.api.JDA
import net.dv8tion.jda.api.Permission
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class MemberMessageLeaderboardController(
    @Autowired val jda: JDA,
    @Autowired val messageService: MessageService
) {
    @GetMapping("/guilds/{guildId}/memberMessageLeaderboard")
    fun getMemberMessageLeaderboard(
        @PathVariable("guildId") guildId: Long,
        @RequestParam("startTime") startTime: Long,
        @RequestParam("endTime") endTime: Long
    ): GetMemberMessageLeaderboardResponse {
        val guild = jda.getGuildById(guildId) ?: throw RuntimeException("no guild with given id")
        val members = guild.members
        val memberMessageCounts = messageService.findMemberMessageLeaderboard(guild, startTime, endTime)

        return GetMemberMessageLeaderboardResponse(
            members.map {
                MemberMessageCount(
                    it.toDto(), memberMessageCounts.getOrDefault(it.idLong, 0)
                )
            }.sortedByDescending { it.count }
        )
    }
}