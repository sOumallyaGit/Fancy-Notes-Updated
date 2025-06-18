import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewChecked
} from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, AfterViewChecked {
  @ViewChild('editor', { static: false }) editorRef!: ElementRef;

  noteTitle = '';
  noteContent = '';
  searchText = '';
  notes: { title: string; content: string; checked: boolean }[] = [];
  isEditing = false;
  editingIndex = -1;
  isCheckedNote = false;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewChecked(): void {
    // Restore checkbox states in all note-content elements
    const noteDivs = document.querySelectorAll('.note-content');
    noteDivs.forEach(div => {
      const checkboxes = div.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((box: HTMLInputElement) => {
        box.checked = box.hasAttribute('checked');
      });
    });
  }

  get filteredNotes() {
    const term = this.searchText.trim().toLowerCase();
    return !term
      ? this.notes
      : this.notes.filter(note =>
          note.title.toLowerCase().includes(term) ||
          note.content.toLowerCase().includes(term)
        );
  }

  formatText(command: string): void {
    document.execCommand(command, false, '');
  }

  insertCheckbox(): void {
    // Inline handler to maintain `checked` state
    document.execCommand(
      'insertHTML',
      false,
      `<input type="checkbox" onclick="if(this.checked){this.setAttribute('checked','');}else{this.removeAttribute('checked');}" /> `
    );
  }

  changeFontSize(size: string): void {
    if (size) {
      document.execCommand('fontSize', false, size);
    }
  }

  onEditorInput(): void {
    const editor = this.editorRef.nativeElement;
    const checkboxes = editor.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach((box: HTMLInputElement) => {
      if (box.checked) {
        box.setAttribute('checked', '');
      } else {
        box.removeAttribute('checked');
      }
    });

    this.noteContent = editor.innerHTML;
  }

  addNote(): void {
    const editor = this.editorRef.nativeElement;

    // Sync checkbox states
    const checkboxes = editor.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((box: HTMLInputElement) => {
      if (box.checked) {
        box.setAttribute('checked', '');
      } else {
        box.removeAttribute('checked');
      }
    });

    const editorContent = editor.innerHTML.trim();

    if (this.noteTitle.trim() && editorContent) {
      if (this.isEditing && this.editingIndex > -1) {
        if (this.notes[this.editingIndex].checked) {
          this.resetForm(); // prevent editing checked note
          return;
        }

        this.notes[this.editingIndex] = {
          ...this.notes[this.editingIndex],
          title: this.noteTitle.trim(),
          content: editorContent
        };
      } else {
        this.notes.unshift({
          title: this.noteTitle.trim(),
          content: editorContent,
          checked: false
        });
      }

      this.resetForm();
    }
  }

  editNote(index: number): void {
    const note = this.notes[index];
    if (note.checked) return;

    this.noteTitle = note.title;
    this.isEditing = true;
    this.editingIndex = index;
    this.isCheckedNote = note.checked;

    setTimeout(() => {
      const editor = this.editorRef.nativeElement;
      editor.innerHTML = note.content;

      const checkboxes = editor.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((box: HTMLInputElement) => {
        box.checked = box.hasAttribute('checked');
      });
    });
  }

  deleteNote(index: number): void {
    this.notes.splice(index, 1);
    this.resetForm();
  }

  resetForm(): void {
    this.noteTitle = '';
    this.noteContent = '';
    this.editorRef.nativeElement.innerHTML = '';
    this.isEditing = false;
    this.editingIndex = -1;
    this.isCheckedNote = false;
  }
}
