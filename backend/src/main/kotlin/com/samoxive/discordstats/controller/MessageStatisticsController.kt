package com.samoxive.discordstats.controller

import com.samoxive.discordstats.controller.response.GetMessageStatisticsResponse
import com.samoxive.discordstats.controller.response.toDto
import com.samoxive.discordstats.service.MessageService
import net.dv8tion.jda.api.JDA
import net.dv8tion.jda.api.Permission
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

const val TIME_POINT_COUNT = 23

@RestController
class MessageStatisticsController(
    @Autowired val jda: JDA,
    @Autowired val messageService: MessageService
) {
    @GetMapping("/guilds/{guildId}/messageStatistics")
    fun getMessageStatistics(
        @PathVariable("guildId") guildId: Long,
        @RequestParam("startTime") startTime: Long,
        @RequestParam("endTime") endTime: Long
    ): GetMessageStatisticsResponse {
        val guild = jda.getGuildById(guildId) ?: throw RuntimeException("no guild with given id")
        val channels = guild.textChannels.filter {
            guild.selfMember.hasPermission(it, Permission.MESSAGE_READ, Permission.MESSAGE_HISTORY)
        }.sortedBy { it.name }

        val messageEntities = messageService.findMessagesBetweenTimes(guild, startTime, endTime)
        val countMap = mutableMapOf<Long, Array<Int>>()
        for (channel in channels) {
            countMap[channel.idLong] = Array(TIME_POINT_COUNT + 1) { 0 }
        }

        val timeIncrements = (endTime - startTime) / TIME_POINT_COUNT
        for (message in messageEntities) {
            val countArray = countMap[message.channelId] ?: continue
            val messageTimeSlot = (message.creationTime - startTime) / timeIncrements
            countArray[messageTimeSlot.toInt()]++
        }

        val dataCount = 0..TIME_POINT_COUNT
        val times = (dataCount).map { startTime + it * timeIncrements }

        return GetMessageStatisticsResponse(
            channels.map { it.toDto() },
            times,
            times.indices.map { i -> channels.map { channel -> countMap[channel.idLong]!![i] } }
        )
    }
}