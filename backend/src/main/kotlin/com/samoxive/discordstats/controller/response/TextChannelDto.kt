package com.samoxive.discordstats.controller.response

import net.dv8tion.jda.api.entities.TextChannel

data class TextChannelDto(
    val id: String,
    val name: String
)

fun TextChannel.toEntity() = TextChannelDto(id, name)