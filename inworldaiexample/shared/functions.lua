if not IsDuplicityVersion() then
    function CreateProp(prop)
        lib.requestModel(prop.model)
        local coords = prop.coords
        local object = CreateObject(prop.model, coords.x, coords.y, coords.z, true, true, true)
        SetEntityCompletelyDisableCollision(object, true, false)
        DisableCamCollisionForEntity(object)
        DisableCamCollisionForObject(object)
        SetModelAsNoLongerNeeded(prop.model)
        return object
    end
    function CreateNpc(ped)
        local ped = ped
        print(json.encode(ped))
        lib.requestModel(ped.model)
        local coords = ped.coords
        ::CreateAgain::
        local npc = CreatePed(0, ped.model, coords.x, coords.y, coords.z, coords.w, ped.isNetwork)
        local att = 1000
        while not DoesEntityExist(npc) do
            att = att - 1
            if att <= 0 then
                goto CreateAgain
            end
            Wait(10)
        end
        if ped.scenario then TaskStartScenarioInPlace(npc, ped.scenario, 0, true) end
        if ped.anim then
            lib.requestAnimDict(ped.anim[1])
            TaskPlayAnim(npc, ped.anim[1], ped.anim[2], 1.0, 1.0, -1, 1, 0.2, 0, 0, 0)
        end
        SetEntityInvincible(npc, true)
        SetBlockingOfNonTemporaryEvents(npc, true)
        FreezeEntityPosition(npc, ped.isFreeze or true)
        SetModelAsNoLongerNeeded(ped.model)
        return npc
    end
    function CreateBlip(data)
        local blip = AddBlipForCoord(data.coords)
        SetBlipAsShortRange(blip, true)
        SetBlipSprite(blip, data.sprite or 1)
        SetBlipColour(blip, data.col or 0)
        SetBlipScale(blip, data.scale or 0.7)
        SetBlipDisplay(blip, (data.disp or 6))
        if data.category then SetBlipCategory(blip, data.category) end
        BeginTextCommandSetBlipName('STRING')
        AddTextComponentString(tostring(data.name))
        EndTextCommandSetBlipName(blip)
        return blip
    end
    function Walk(name,ped)
        lib.requestAnimSet(name)
        SetPedMovementClipset(ped, name, 0.2)
        RemoveAnimSet(name)
      end
      
end