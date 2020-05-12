package com.samoxive.discordstats.controller

import com.samoxive.discordstats.controller.response.GuildDto
import com.samoxive.discordstats.controller.response.TextChannelDto
import net.dv8tion.jda.api.JDA
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class GuildController(@Autowired val jda: JDA) {
    @GetMapping("/guilds")
    fun getGuilds(): List<GuildDto> {
        return jda.guilds.map { guild ->
            GuildDto(
                guild.id,
                guild.name,
                guild.iconUrl,
                guild.textChannels.map { channel ->
                    TextChannelDto(
                        channel.id,
                        channel.name
                    )
                }
            )
        }
    }
}