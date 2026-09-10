<?php

namespace App\Console\Commands;

use App\Actions\Ocean\GenerateOceanPainting;
use Carbon\CarbonImmutable;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('ocean:paint {date? : The date to generate a painting for (Y-m-d), defaults to today}')]
#[Description('Fetch ocean conditions and generate (or refresh) the painting for a given day')]
class GenerateOceanPaintingCommand extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(GenerateOceanPainting $action): int
    {
        $date = $this->argument('date');

        $painting = $action->handle($date ? CarbonImmutable::parse($date) : null);

        $this->info("Ocean painting ready for {$painting->date->toDateString()} (seed: {$painting->seed}).");

        return self::SUCCESS;
    }
}
