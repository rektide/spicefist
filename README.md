# SpiceFist #

SpiceFist adds color flare and style to one's otherwise drab desktop.

* A small app/service to pick and optionally verify a random color palette from the [Color Lovers API](http://www.colourlovers.com/api#pallete).
* A terminal launching dbus service.

Inspired by decades of vim color schemes, and handbuilt shell scripts and aliases to kick off terminals of a different color, it seemed logical to build a set of small pieces to help me launch terminals in splendid coordinated colors.

SpiceFist is documented first at a service level, then at the integration level.

# Model #

## PaletteSelection ##

SpiceFist is ultimately about PaletteSelections, a choice of colors

## ColorSelection ##

PaletteSelection is comprised of a number of ColorSelection s.

# Services #

* ColorFetcherService is a service which retrieves a random PaletteSelection.
* ValidatorServices are any service which wraps a ColorFetcherService with some kind of user validation, meaning someone has to OK the selection before it goes through.
  - XValidatorService posts potential palettes to the screen and validates by way of the Notification api.
  - TermValidatorService posts console output in the candidate colors for validation and requires terminal access to ok.
  - WebValidatorService is a resident validator for outstanding PaletteSelection s.
  - WebHookValidatorService calls out to a WebService for validation.
* ActivePaletteService maintains a list of active and in use palettes, is a coordinating agent.
* TermLaunch is a service which picks a color from the ActivePaletteService and launches a terminal with it.
