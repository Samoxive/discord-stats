package com.samoxive.discordstats.controller.response

data class GuildDto(
    val id: String,
    val name: String,
    val iconUrl: String?,
    val channels: List<TextChannelDto>
)