---
title: "Indie Game Academy - Full GDD Template"
author: "Indie Game Academy"
source_file: "5_Bo_50MB_OpenClaw/clean_docs/IndieGameAcademy_GDD_Template.pdf"
format: "markdown"
total_pages: 9
converted_by: "PyMuPDF + RapidOCR Layout Engine"
---

# Indie Game Academy - Full GDD Template
**Tác giả:** Indie Game Academy

---


<!-- Trang 1 -->

This template is property of the Indie Game Academy

Hello there!

Feel free to use this GDD template for any personal or commercial

projects. We’re happy to help!

We just ask that if you use this template, share it at least once with

someone else who might need it too! And if you create something 
with it, please let us see it! Email it to team@indiegameacademy.com

and share it on our Discord server to get celebrated by an amazing

community of supportive people. You can also use

#indiegameacademy to share it on social media.

Happy designing!


<!-- Trang 2 -->

What’s a GDD?

A Game Design Document (Or GDD in short) is a document made to express the vision for a 
game, describe its contents and present an implementation plan. The GDD needs to be able 
to communicate the vision of the game in sufficient detail to implement it, and to help 
connect team members to one consistent idea throughout the whole development process, 
even if new members join the team.  
 
This doesn’t remove the need to have team meetings to discuss things; getting everyone’s 
opinion on an idea before it’s fully documented is often a faster way to reach a consensus on 
what’s right for the game. The GDD is a living document: meaning that it will be continually 
edited and updated as needed. This document expresses the consensus that you have 
already reached, flesh out those ideas and eliminate any possible vagueness that might 
interfere with the development process.  
 
Having these guidelines will allow your team to remove hype elements, forcing you to define 
the more substantial elements of the game, scaling the game to a more doable state; it will 
also give you clarity and certainty in the design process, easing the scheduling and planning. 
Because this is meant to be read by several people, both old and new to the team, multiple 
times during the development of the game, you also want to keep it legible, in a way that’s 
easy to read whole without taking too much time.  
 
Here are some GDD examples for you to use as reference:  
 
Race’n’Chase GDD (Later called Grand Theft Auto) 
Majestic Revolutions GDD (Later called Deus Ex) 
Diablo GDD 
Doom Bible 
Wasteland 2 Vision Document 
Captain Claw Bible 
Saints Row Undercover GDD

Key notes

●​ These days, GDDs tend to be shorter, not longer. Challenge yourself to explain 
features concisely, and leave some parts open to the team. Sometimes fewer details 
are better, especially if the scope of your game is large (No one wants to read a 
100-page long GDD). 
●​ Make this as you visualize your game: Even if it doesn’t feel like you’ll be able to 
gather a full team to take on all the necessary tasks, plan as if you have a full team, 
you can scale it to size and prioritize elements. If you feel like you want a feature like 
that in your game, put it in here. 
●​ If one of the sections doesn’t make sense for your game, feel free to delete it from 
the final document or use “Not applicable”.  
●​ Make sure the final version is coherent; re-read it several times and send it to friends 
first. If other people understand it with a simple read, then you’re doing great.  
●​ Have fun!


<!-- Trang 3 -->

Game Design Document (GDD)

[Working title]

Table of contents

1.​
Introduction 
1.1.​
Scope of the document 
1.2.​
Elevator pitch 
2.​
Game overview 
2.1.​
Game concept 
2.2.​
Audience 
2.3.​
Genre 
2.4.​
Setting 
2.5.​
Game structure 
2.6.​
Player 
2.7.​
Game flow summary 
2.8.​
Look & Feel 
3.​
Gameplay 
3.1.​
Objectives 
3.2.​
Progression 
3.2.1.​
Challenge structure 
3.3.​
Play flow 
3.4.​
Difficulty 
4.​
Mechanics 
4.1.​
Rules 
4.2.​
Game universe 
4.3.​
Physics 
4.4.​
Economy 
4.5.​
Character movement 
4.6.​
Player interaction 
4.6.1.​
Game menus 
4.6.2.​
Saving 
4.6.3.​
Game options 
4.7.​
Assets 
5.​
Graphics and audio 
5.1.​
Visual system 
5.1.1.​
Player camera 
5.1.2.​
Landscape 
5.2.​
Interface 
5.3.​
Audio system 
5.3.1.​
Game music 
5.3.2.​
Audio look & feel


<!-- Trang 4 -->

6.​
Story and narrative 
6.1.​
Backstory 
6.2.​
Main plot 
6.2.1.​
Plot progression 
6.3.​
Cutscenes 
7.​
Characters 
7.1.​
Main characters 
7.1.1.​
Backstory 
7.1.2.​
Personality 
7.1.3.​
Appearance 
7.1.4.​
Abilities 
7.1.5.​
Relationships 
7.2.​
Supporting characters 
7.3.​
Enemies 
8.​
Game world 
8.1.​
Look & Feel of the world 
8.2.​
Locations 
8.2.1.​
Connection to the plot 
8.3.​
Levels 
8.3.1.​
Tutorial level 
8.3.2.​
Main levels 
8.3.3.​
Optional levels


<!-- Trang 5 -->

1. Introduction

1.1. Scope of the document

Who’s this document meant for? Who’ll read it? The dev team? Stakeholders? Investors?

1.2. Elevator pitch

Tell what your game is about in less than 75 words and why it is a promising idea.

2. Game Overview

2.1. Game concept

A summary of the game and gameplay. What’s the objective of the game? What do you want 
your players to feel while playing it? What’s the main thing they’ll be doing? What will they 
enjoy?

2.2. Audience

What are the characteristics of the people who’ll play the game? What’s their age range? 
What genres do they like? What similar games do they play? Everything that you know 
about them and most importantly, how do you know these people will actually buy your 
game?

2.3. Genre

What genre would this game be cataloged as? Tower defense, FPS, Puzzle Platformer? 
 
Need help definining a genre? Here’s our chart to help you.

2.4. Setting

Where does the game take place? Medieval world? Fantasy world? Real world? Real world 
but with fictional events? An alternate reality where something from the past never 
happened?

2.5. World structure

How does the player navigate the world? Do they move linearly through levels? Is it an open world 
that they can explore freely?

2.6. Player

Who will the player play as? Is it singleplayer or multiplayer? Ex: “Each player plays as one 
of four knights, each of which has an elemental affinity. Up to four players can play at a time. 
(Castle Crashers)"


<!-- Trang 6 -->

2.7. Core loop

The very basic actions the player takes when playing the game: Moving and shooting, 
running and jumping, reading and picking dialogue options, drawing and playing a card, etc.

2.8. Look & Feel

Look refers to the game's visual style (graphics, animations, color wheel, etc.). Feel refers to 
the playability and the parts of the game that can affect the user, such as story or music. And 
something important to remember: the “look” influences the “feel”. You canuse  images of 
other games/media as a reference.

3. Gameplay

3.1. Objectives

What is the main objective for the player? And what are the secondary objectives? Ex: The 
main objective is beating the final boss in the final level, the secondary objectives are 
fetching the hidden pieces in the earlier levels, discovering the story secrets through the map 
and beating the secret boss.

3.2. Progression

How will the player progress throughout the game? It can be anything from how they 
advance to the next area to how the leveling influences the world around the player.

3.2.1. Difficulty curve

A somewhat optional section, use this if the difficulty setting of your game is not as simple as 
different attribute values, as for example, if the enemy learns from the player’s actions and 
adapts to them, and how it will affect the progression of the game.

3.3. Play flow

Similar to the Core Loop section, here you’ll detail the expected flow of gameplay from the 
player’s perspective, not just the core loops of it. Mention if they are expected to do a couple 
of side missions before a main one, if they will gather collectibles to enhance their abilities at 
a specific point in the game, etc.

3.4. Difficulty

How will the difficulty of the game affect gameplay? How many different levels of difficulty will 
be implemented?

4. Mechanics

Most of the time, you will customize this section of the GDD to each of your games. For 
example, if your game has combat in it, you want to include a segment of “Combat” and one 
for “AI”, or if your game has a unique system for spawning, you’ll want to mention how it 
works.


<!-- Trang 7 -->

4.1. Rules

The general rules of the game, what are the limits of the player’s actions.

4.2. Game universe

How the game universe works. Mention here the stuff that is done outside of the perception 
of the player, like restocking inventories of key NPCs.

4.3. Physics

The overall physics of the world. Is it realistic? Low gravity? Destroyable environment?

4.4. Economy

Does your game have an economy? What is the currency? How many currencies does it 
have? How does the player gain and lose currency? How is it balanced?

4.5. Character movement

The range of movement that the player has within the game world.

4.6. Player interaction

What can the player interact with?

4.6.1. Game menus

A brief mention on how the game menus work and what options are available to the player.

4.6.2. Saving

How will saving work with the game? Are there save points? Can the player save anywhere?

4.6.3. Game options

What options can the player change from the menus?

4.7. Assets

A list of the main assets that the game will use, split by type: “Player Model, Player Texture, 
Enemy Model, Terrain Material, Enemy Death Sound, etc.

5. Graphics and audio

5.1. Visual system

An overall mention of how the visuals of the game will work, and if there’s a reason behind it. 
Is it 2D or 3D? Cell-shaded, minimalistic or realistic?

5.1.1. Player camera

How will the player see the game? If you have different types of cameras, mention them.


<!-- Trang 8 -->

5.1.2. Landscape

What will the landscapes of the game look like? This is extremely important if your game is a 
platformer.

5.2. Interface

What will the user interface look like? How will the player interact with it? How will it affect 
gameplay?

5.3. Audio system

An overall mention of how the audio of the game will work, and if there’s a reason behind it. 
If your game has in-game voice chat, be sure to include it here.

5.3.1. Game music

What type of music will you use in the game? This segment can be quite large for some 
games that have music as one of their main assets for gameplay/storytelling.

5.3.2. Audio look & feel

What does the game’s audio want to convey? How is it going to feel for the player? Tense? 
Whimsical? Transmit a feeling of dread?

6. Story and narrative

6.1. Backstory

What events of interest happened before the start of the game?

6.2. Main plot

What’s the main plot of the game? Just write the most important stuff here in a condensed 
form, remember that this is a game design document, not a web novel.

6.2.1. Plot progression

How will the plot progress throughout the game?

6.3. Cutscenes

Don’t mention specific cutscenes (Just do it if they are extremely relevant to the game), only 
mention how you will use cutscenes in gameplay.

7. Characters

7.1. Main characters

Who are the main characters in the game? If you have more than one, then add a small 
description of all subpoints from this segment for each one of them.


<!-- Trang 9 -->

7.1.1. Backstory

7.1.2. Personality

7.1.3. Appearance

7.1.4. Abilities

7.1.5. Relationships

7.2. Supporting characters

Who are the main enemies? You don’t have to include all the previous subpoints for this one, 
just a brief description of them.

7.3. Enemies

Who are the supporting characters? As with the supporting characters, you don’t have to 
include all main character’s subpoints, except if the enemy description plays a huge part in 
the overall plot of the game.

8. Game world

8.1. Look & Feel of the world

Similar to 2.8, but in this case, you’re just talking about the game world, not the game in 
general.

8.2. Locations

What are the most important locations in the game and how will they be relevant to the 
game?

8.2.1. Connection to the plot

Add this one for every mentioned location to tell how they will connect to the plot.

8.3. Levels

Just as each one of their names says, briefly describe the levels of the game (If there’s any).

8.3.1. Tutorial levels

8.3.2. Main levels

8.3.3. Optional levels
