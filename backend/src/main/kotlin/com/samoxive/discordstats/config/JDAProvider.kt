package com.samoxive.discordstats.config

import com.samoxive.discordstats.discord.EventListener
import net.dv8tion.jda.api.JDA
import net.dv8tion.jda.api.JDABuilder
import net.dv8tion.jda.api.entities.Activity
import net.dv8tion.jda.api.requests.GatewayIntent
import net.dv8tion.jda.api.utils.cache.CacheFlag
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class JDAProvider(
    @Autowired val discordConfig: DiscordConfig,
    @Autowired val eventListener: EventListener
) {
    @Bean
    fun jda(): JDA {
        return JDABuilder.createDefault(
            discordConfig.token,
            GatewayIntent.GUILD_MEMBERS,
            GatewayIntent.GUILD_PRESENCES,
            GatewayIntent.GUILD_MESSAGES
        )
            .addEventListeners(eventListener)
            .disableCache(
                CacheFlag.EMOTE,
                CacheFlag.VOICE_STATE,
                CacheFlag.MEMBER_OVERRIDES,
                CacheFlag.ACTIVITY
            )
            .build()
            .awaitReady()
    }
}