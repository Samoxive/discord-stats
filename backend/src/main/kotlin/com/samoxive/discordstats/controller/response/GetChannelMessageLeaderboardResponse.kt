package com.samoxive.discordstats.controller.response

data class GetChannelMessageLeaderboardResponse (
    val data: List<ChannelMessageCount>
)

data class ChannelMessageCount(
    val channel: TextChannelDto,
    val count: Int
)