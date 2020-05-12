package com.samoxive.discordstats.controller.response

data class GetMessageStatisticsResponse(
    val data: List<ChannelMessageStatistics>
)

data class ChannelMessageStatistics(
    val channel: TextChannelDto,
    val messageCounts: List<DataPoint>
)
