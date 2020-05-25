package com.samoxive.discordstats.controller

import com.samoxive.discordstats.controller.response.GuildDto
import com.samoxive.discordstats.controller.response.toDto
import net.dv8tion.jda.api.JDA
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class GuildController(@Autowired val jda: JDA) {
    @GetMapping("/guilds")
    fun getGuilds(): List<GuildDto> {
        return jda.guilds.map { it.toDto() }
    }
}