let itemAmount = 0;
let updateDelay = 60; // ticks (1 second)
let timer = 0;
let liquidAmount = 9999;
// Teams affected
let enabledTeams = [Team.sharded];

Events.run(Trigger.update, () => {

    timer++;
    if(timer < updateDelay) return;
    timer = 0;

    Groups.build.each(build => {

        // Team filter
        if(!enabledTeams.includes(build.team)) return;

        // Ignore cores
        if(build.block instanceof CoreBlock) return;

        let consumers = build.block.consumers;
        if(consumers == null) return;

        // ========================
        // ITEM CONSUMPTION SYSTEM
        // ========================
        for(let i = 0; i < consumers.length; i++){
            let cons = consumers[i];
            
            if(cons instanceof ConsumeItems){

                cons.items.forEach(stack => {

    let item = stack.item;
    let cap = build.block.itemCapacity;

    if(cap == null) return;

    let current = build.items.get(item);

    // 🔥 clamp to capacity
    if(current < cap){
        build.items.set(item, cap);
    }

});

    }
             // ========================
        // BLOCK REQUIREMENTS SYSTEM
        // ========================

        // let reqs = build.block.requirements;

        // if(reqs != null){

        //     reqs.forEach(req => {

        //         let item = req.item;
        //         let cap = build.block.itemCapacity;

        //         if(cap == null) return;
        //         // FIX CRASH
        //         if(build.items == null) return;
                
        //         let current = build.items.get(item);

        //         if(current < cap){
        //             build.items.set(item, cap);
        //         }

        //     });

        // }

            // ========================
            // LIQUID SUPPORT (optional but powerful)
            // ========================
           if(cons instanceof ConsumeLiquid){

    let liquid = cons.liquid;

    if(liquid && build.liquids){

        let cap = build.block.liquidCapacity || 1000;

        let current = build.liquids.get(liquid);

        if(current < cap){
            build.liquids.add(liquid, cap - current);
        }

                }
            }

        }

        // ========================
        // AMMO SUPPORT (turrets)
        // ========================
        // if(build.block.ammoTypes != null && build.items != null){

        //     build.block.ammoTypes.each((item, type) => {

        //         build.items.add(item, itemAmount);

        //     });

        // }

    });

});

// ================= UI =================
Events.on(ClientLoadEvent, e => {

    const dialog = new BaseDialog("Infinite Resource Settings");

    dialog.cont.pane(t => {

        // ===== ITEM AMOUNT =====
        t.add("Items Per Execution").row();

        let amountLabel = t.add("" + itemAmount).get();

        t.row();

        t.slider(0, 25, 1, itemAmount, v => {

            itemAmount = Math.floor(v);
            amountLabel.setText("" + itemAmount);

        }).width(300);

        t.row();

        // ===== DELAY =====
        t.add("Delay (seconds)").padTop(20).row();

        let delayLabel = t.add("" + (updateDelay / 60).toFixed(1)).get();

        t.row();

        t.slider(0.1, 10, 0.1, updateDelay / 60, v => {

            updateDelay = Math.floor(v * 60);
            delayLabel.setText(v.toFixed(1));

        }).width(300);

        t.row();

        // ===== TEAM SELECT =====
        t.add("Select Teams").padTop(20).row();

        let teamTable = t.table().get();

        Team.all.forEach(team => {

            teamTable.check(team.name, enabledTeams.includes(team), checked => {

                if(checked){
                    if(!enabledTeams.includes(team)){
                        enabledTeams.push(team);
                    }
                } else {
                    enabledTeams = enabledTeams.filter(t => t != team);
                }

            }).row();

        });

    });

    dialog.buttons.button("Close", () => {
        dialog.hide();
    });

    Vars.ui.hudGroup.fill(cons(table => {

        table.top().left();

        table.button("∞", run(() => {
            dialog.show();
        })).size(50);

    }));

});