package com.samoxive.discordstats.controller.response

import net.dv8tion.jda.api.entities.Guild

data class GuildDto(
    val id: String,
    val name: String,
    val iconUrl: String?,
    val channels: List<TextChannelDto>
)

fun Guild.toDto() = GuildDto(id, name, iconUrl, textChannels.map { it.toDto() })