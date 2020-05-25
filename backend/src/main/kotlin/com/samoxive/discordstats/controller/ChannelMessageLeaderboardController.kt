package com.samoxive.discordstats.controller

import com.samoxive.discordstats.controller.response.ChannelMessageCount
import com.samoxive.discordstats.controller.response.GetChannelMessageLeaderboardResponse
import com.samoxive.discordstats.controller.response.toDto
import com.samoxive.discordstats.service.MessageService
import net.dv8tion.jda.api.JDA
import net.dv8tion.jda.api.Permission
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class ChannelMessageLeaderboardController(
    @Autowired val jda: JDA,
    @Autowired val messageService: MessageService
) {
    @GetMapping("/guilds/{guildId}/channelMessageLeaderboard")
    fun getChannelMessageLeaderboard(
        @PathVariable("guildId") guildId: Long,
        @RequestParam("startTime") startTime: Long,
        @RequestParam("endTime") endTime: Long
    ): GetChannelMessageLeaderboardResponse {
        val guild = jda.getGuildById(guildId) ?: throw RuntimeException("no guild with given id")
        val channels = guild.textChannels.filter {
            guild.selfMember.hasPermission(it, Permission.MESSAGE_READ, Permission.MESSAGE_HISTORY)
        }

        val channelMessageCounts = messageService.findChannelMessageLeaderboard(guild, startTime, endTime)

        return GetChannelMessageLeaderboardResponse(
            channels.map {
                ChannelMessageCount(
                    it.toDto(), channelMessageCounts.getOrDefault(it.idLong, 0)
                )
            }.sortedByDescending { it.count }
        )
    }
}