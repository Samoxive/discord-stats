package com.samoxive.discordstats.controller.response

data class GetMessageStatisticsResponse(
    val channels: List<TextChannelDto>,
    val timePoints: List<Long>,
    val dataPoints: List<List<Int>>
)

