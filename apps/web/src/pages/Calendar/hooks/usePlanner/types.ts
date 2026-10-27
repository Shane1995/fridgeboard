export type AddLineOptions = { sectionId: string };

export type UpdateLineOptions = { sectionId: string; lineId: string; text: string };

export type RemoveLineOptions = { sectionId: string; lineId: string };

export type LinkRecipeOptions = {
  sectionId: string;
  lineId: string;
  recipeId: string;
  name: string;
};

export type UnlinkRecipeOptions = { sectionId: string; lineId: string };

export type RenameNoteOptions = { sectionId: string; title: string };

export type DeleteNoteOptions = { sectionId: string };
