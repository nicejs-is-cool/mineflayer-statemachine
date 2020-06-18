import { StateBehavior, StateMachineTargets } from "../statemachine";
import { Bot } from "mineflayer";
import { Entity } from "prismarine-entity";
import { Movements, goals } from "mineflayer-pathfinder";

/**
 * Causes the bot to follow the target entity.
 * 
 * This behavior relies on the mineflayer-pathfinding plugin to be installed.
 */
export class BehaviorFollowEntity implements StateBehavior
{
    private readonly bot: Bot;
    private readonly mcData: any;

    readonly targets: StateMachineTargets;
    readonly movements: Movements;
    stateName: string = 'followEntity';
    active: boolean = false;
    followDistance: number = 0;

    constructor(bot: Bot, targets: StateMachineTargets)
    {
        this.bot = bot;
        this.targets = targets;
        this.mcData = require('minecraft-data')(this.bot.version);
        this.movements = new Movements(this.bot, this.mcData);
    }

    onStateEntered(): void
    {
        this.startMoving();
    }

    onStateExited(): void
    {
        this.stopMoving();
    }

    /**
     * Sets the target entity this bot should follow. If the bot
     * is currently following another entity, it will stop following
     * that entity and follow this entity instead.
     * 
     * If the bot is not currently in this behavior state, the entity
     * will still be assigned as the target entity when this state is
     * entered.
     * 
     * Calling this method will update the targets object.
     * 
     * @param entity - The entity to follow.
     */
    setFollowTarget(entity: Entity): void
    {
        if (this.targets.entity === entity)
            return;

        this.targets.entity = entity;
        this.restart();
    }

    /**
     * Cancels the current path finding operation.
     */
    private stopMoving(): void
    {
        // @ts-ignore
        let pathfinder = this.bot.pathfinder;
        pathfinder.setGoal(null);
    }

    /**
     * Starts a new path finding operation.
     */
    private startMoving(): void
    {
        let entity = this.targets.entity;
        if (!entity)
            return;

        // @ts-ignore
        let pathfinder = this.bot.pathfinder;

        const goal = new goals.GoalFollow(entity, this.followDistance);
        pathfinder.setMovements(this.movements);
        pathfinder.setGoal(goal, true);
    }

    /**
     * Stops and restarts this movement behavior. Does nothing if
     * this behavior is not active.
     * 
     * Useful if the target entity is updated while this behavior
     * is still active.
     */
    restart(): void
    {
        if (!this.active)
            return;

        this.stopMoving();
        this.startMoving();
    }

    /**
     * Gets the distance to the target entity.
     * 
     * @returns The distance, or 0 if no target entity is assigned.
     */
    distanceToTarget(): number
    {
        let entity = this.targets.entity;
        if (!entity)
            return 0;

        // @ts-ignore
        return this.bot.entity.position.distanceTo(entity.position);
    }
}