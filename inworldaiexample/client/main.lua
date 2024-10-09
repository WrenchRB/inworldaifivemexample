local xSound = exports.xsound
local ped, isThinking, isTalking, last

Citizen.CreateThread(function ()
    ped = CreateNpc({model=GetHashKey("ig_lestercrest_2"), coords=vector4(705.679138, -967.002197, 29.391968, 314.645660)})
    Walk("move_m@gangster@var_i",ped)
    exports.ox_target:addLocalEntity(ped, {label="Talk to Lester", name = "lester", distance = 3, onSelect = function ()
        lib.showMenu("lester_start")
    end})
    TriggerServerEvent("inworldai:setPlayerData", {id = 8585, fullName = "Mr Wrench", profile = {
        fields = {
            {id = 'Name', value = "Mr Wrench"},
            {id = 'Gender', value = "Male"},
            {id = 'Role', value = "Robber"},
            {id = 'Job', value = "unemployed"},
        }
    }})
end)

lib.registerMenu({
    id = "lester_start",
    title = "Start Talking With Lester",
    canClose = true,
    options = {
        {label = "Talk With Voice(N keybind)", description = 'Only English'},
        {label = "Talk With Text", description = 'Only English'},
    },
    position = "bottom-right",
}, function(selected, scrollIndex, args)
    lib.hideMenu()
    if isThinking or isTalking then
        notif({text= "Pls Wait for lester response", type= "warning"})
        return
    end

    if selected == 1 then
        isThinking = true
        SendNUIMessage({action="listen"})
        repeat
            Wait(0)
        until IsControlPressed(0, 249)
        SendNUIMessage({action="keydown"})

        repeat
            Wait(100)
        until not IsControlPressed(0, 249)
        SendNUIMessage({action="keyup"})

    elseif selected == 2 then
        notif({text= "Lester is listening", type= "success"})
        ::getagain::
        local input = lib.inputDialog("Type Menu", {{type="input"}}, {})
        if not input then return end
        if isThinking or isTalking then
            notif({text= "Pls Wait for lester response", type= "warning"})
            goto getagain 
        end
        local text = input[1]
        if not text then 
            goto getagain 
        end
        sendToBackEnd(text)
        isThinking = true
        notif({text= "Lester is thinking", type= "success"})
        goto getagain
    end
end)

function notif(data)
    local text = data.text
    lib.notify({id = "mwnuinotif", title = text, type = data.type, position = 'center-left'})
end

RegisterNUICallback('notif', function(data, cb)
    notif(data)
    cb("ok")
end) 

RegisterNUICallback('sendToBackEnd', function(data, cb)
    local chunk = data.chunk
    sendToBackEnd(nil, chunk)
    cb("ok")
end) 

function sendToBackEnd(text, chunk)
    TriggerServerEvent("inworldai:sendDataToBackEnd", text, Scene, last, event, param, chunk)
end

RegisterNetEvent("inworldai:getDataFromBackEnd", function(data)
    if not isThinking then return end
    -- print(type(data))
    -- print(json.encode(data))
    play(data)
end)
local others = {}
RegisterNetEvent("inworldai:getAudioDataFromBackEnd", function(link)
    if isTalking then
        table.insert(others, link)
        return
    end
    play2(link)
end)

-- RegisterNetEvent("esx:playerLoaded", function(player)
--     local fullName = player.firstName.." "..player.lastName
--     local id = player.identifier
--     local job = player.job and player.job.label or "unemployed"
--     TriggerServerEvent("inworldai:setPlayerData", {id = id, fullName = fullName, profile = {
--         fields = {
--             {id = 'Name', value = fullName},
--             {id = 'Gender', value = player.sex == "m" and "Male" or "Female"},
--             {id = 'Role', value = "Robber"},
--             {id = 'Job', value = job},
--         }
--     }})
-- end)




function play2(link)
    local pos = GetEntityCoords(ped)
    local ended
    isTalking = true
    local options =
    {
        onPlayStart = function(event) 
            lib.requestAnimDict('mp_facial')
            PlayFacialAnim(ped, "mic_chatter", "mp_facial")  

        end,
        onPlayEnd = function(event) 
            SendNUIMessage({action="stopTalking"})
            lib.requestAnimDict('facials@gen_male@variations@normal')
            PlayFacialAnim(ped, "mood_normal_1", "facials@gen_male@base")
            ended = true
        end,
        -- onPlayPause = function(event) 
        --     if ended then return end
        --     ended = true
        --     SendNUIMessage({action="stopTalking"})
        --     lib.requestAnimDict('facials@gen_male@variations@normal')
        --     PlayFacialAnim(ped, "mood_normal_1", "facials@gen_male@base")
        --     xSound:Destroy("inworldai")
        -- end,
    }   
    xSound:PlayUrlPos("inworldai"..link, link, 1, pos, false, options)
    xSound:Distance("inworldai"..link, 10)
    repeat
        Wait(100)
    until ended
    if #others ~=0 then
        local url = others[1]
        table.remove(others, 1)
        play2(url)
    end
    isTalking = false
end

function play(data)
    isThinking = false
    -- isTalking = true
    local pos = GetEntityCoords(ped)
    TriggerEvent('chat:addMessage',{
        color = {255, 200, 133},
        multiline = true,
        args = {'Lester Crest', "^0"..data.texts}
    })
    if data.texts2 then
        TriggerEvent('chat:addMessage',{
            color = {255, 200, 133},
            multiline = true,
            args = {'^3Lester Crest', "^0"..data.texts}
        })
    end
    local function compareByIndex(a, b)
        return a.index < b.index
    end
    table.sort(data.audios, compareByIndex)
      
    -- for i, value in ipairs(data.audios) do
    --     local ended = false
    --     local options =
    --     {
    --         onPlayStart = function(event) 
    --             lib.requestAnimDict('mp_facial')
    --             PlayFacialAnim(ped, "mic_chatter", "mp_facial")  
   
    --         end,
    --         onPlayEnd = function(event) 
    --             SendNUIMessage({action="stopTalking"})
    --             lib.requestAnimDict('facials@gen_male@variations@normal')
    --             PlayFacialAnim(ped, "mood_normal_1", "facials@gen_male@base")
    --             ended = true
    --             if i == #data.audios then
    --                 isTalking = false
    --             end
    --         end,
    --         -- onPlayPause = function(event) 
    --         --     if ended then return end
    --         --     ended = true
    --         --     SendNUIMessage({action="stopTalking"})
    --         --     lib.requestAnimDict('facials@gen_male@variations@normal')
    --         --     PlayFacialAnim(ped, "mood_normal_1", "facials@gen_male@base")
    --         --     xSound:Destroy("inworldai")
    --         -- end,
    --     }   
    --     xSound:PlayUrlPos("inworldai"..i, value.url, 1, pos, false, options)
    --     xSound:Distance("inworldai"..i, 10)
    --     repeat
    --         Wait(100)
    --     until ended
    -- end
    last = data.last
    print(json.encode(data.trigger))
end
