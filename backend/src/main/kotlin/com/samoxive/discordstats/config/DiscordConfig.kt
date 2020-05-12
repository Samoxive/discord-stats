package com.samoxive.discordstats.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
data class DiscordConfig(
    @Value("\${discord.token}")
    val token: String
)